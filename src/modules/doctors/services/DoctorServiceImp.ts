import { AppointmentRepository } from '@/interfaces/repositories/AppointmentRepository '
import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { DoctorService } from '@/interfaces/services/DoctorService'
import { usersTotal } from '@/metrics'
import { AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { CreateBloquedDateDTO } from '@/modules/doctors/dtos/CreateBloquedDateDTO'
import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { GetDoctorAvailabilityDTO } from '@/modules/doctors/dtos/GetDoctorAvailabilityDTO'
import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { validateCreateBlockedDate } from '@/modules/doctors/validators/validateCreateBlockedDate'
import { GetDoctorsQueryDTO } from '@/modules/doctors/validators/validateQueryParameters'
import notificationService from '@/modules/notifications/services/notificationService'
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/AppError'
import { DocumentValidator } from '@/shared/utils/documentValidator'
import { BlockedDate, MedicalSpecialty, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import { fromZonedTime } from 'date-fns-tz'

export class DoctorServiceImp implements DoctorService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly appointmentrepository: AppointmentRepository
  ) {}

  async createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<Doctor> {
    if (!DocumentValidator.validateCPF(createDoctorDTO.cpf)) throw new BadRequestError('Invalid CPF format')

    const existingCPF = await this.doctorRepository.findDoctorByCPF(createDoctorDTO.cpf)

    if (existingCPF) throw new ConflictError('CPF already exists')

    const existingEmail = await this.doctorRepository.getDoctorByEmail(createDoctorDTO.email)

    if (existingEmail) throw new ConflictError('Email already exists')

    const passwordHash = await bcrypt.hash(createDoctorDTO.passwordHash, 10)

    const doctorData = {
      ...createDoctorDTO,
      status: UserStatus.PENDING,
      role: UserRole.DOCTOR,
      passwordHash,
    }

    const doctor = await this.doctorRepository.createDoctor(doctorData)

    await this.countTotalDoctors(UserRole.DOCTOR)

    await notificationService.sendNewDoctorNotification(doctor.email, doctor.name, doctor.id)

    return doctor
  }

  async getDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.getDoctorById(id)

    if (!doctor) throw new NotFoundError('Doctor not found')

    return doctor
  }

  async updateDoctor(id: string, updateDoctorDTO: UpdateDoctorDTO): Promise<Doctor> {
    await this.getDoctorById(id)

    return await this.doctorRepository.updateDoctor(id, updateDoctorDTO)
  }

  async findAllAvailableDoctors(queryDto?: GetDoctorsQueryDTO): Promise<Doctor[]> {
    if (!queryDto) {
      return await this.doctorRepository.findAllAvailableDoctors({})
    }

    const filters = {
      specialty: queryDto.specialty as MedicalSpecialty | undefined,
      status: (queryDto.status as UserStatus) || UserStatus.ACTIVE,
      pagination:
        queryDto.page && queryDto.limit
          ? {
              page: queryDto.page,
              limit: queryDto.limit,
            }
          : undefined,
    }

    return await this.doctorRepository.findAllAvailableDoctors(filters)
  }

  async getDoctorByEmail(email: string): Promise<PrismaDoctor | null> {
    const doctor = await this.doctorRepository.getDoctorByEmail(email)
    return doctor
  }

  async blockedDate(doctorId: string, createBloquedDateDTO: CreateBloquedDateDTO): Promise<BlockedDate> {
    await this.getDoctorById(doctorId)

    const validatedData = validateCreateBlockedDate(createBloquedDateDTO)

    const blockedDateISO = fromZonedTime(validatedData.date, 'America/Sao_Paulo')

    const blockedDates = await this.doctorRepository.getBlockedDates(doctorId, blockedDateISO, blockedDateISO)

    if (blockedDates.length > 0) {
      throw new ConflictError('This date is already blocked')
    }

    return this.doctorRepository.blockedDate(doctorId, blockedDateISO, createBloquedDateDTO.reason)
  }

  async cancelBlockedDate(doctorId: string, date: Date): Promise<BlockedDate> {
    await this.getDoctorById(doctorId)

    const blockedDateISO = fromZonedTime(date, 'America/Sao_Paulo')

    const blockedDates = await this.doctorRepository.getBlockedDates(doctorId, blockedDateISO, blockedDateISO)

    if (blockedDates.length === 0) {
      throw new NotFoundError('This date is not blocked')
    }

    return this.doctorRepository.cancelBlockedDate(doctorId, blockedDateISO)
  }

  async getBlockedDates(doctorId: string): Promise<Date[]> {
    await this.getDoctorById(doctorId)

    return this.doctorRepository.getAllBlockedDates(doctorId)
  }

  async getDoctorAvailability(doctorId: string): Promise<GetDoctorAvailabilityDTO> {
    await this.getDoctorById(doctorId)

    const today = new Date()
    const threeMonthsFromNow = this.calculateThreeMonthsFromNow(today)

    const appointments = await this.appointmentrepository.getAppointmentsByUser(doctorId, UserRole.DOCTOR)

    const blockedDates = await this.doctorRepository.getAllBlockedDates(doctorId)

    const availability = this.generateAvailabilityForPeriod(today, threeMonthsFromNow, appointments, blockedDates)

    return {
      doctorId,
      period: {
        startDate: today,
        endDate: threeMonthsFromNow,
      },
      availability,
    }
  }

  private calculateThreeMonthsFromNow(startDate: Date): Date {
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 3)
    return endDate
  }

  private generateAvailabilityForPeriod(
    startDate: Date,
    endDate: Date,
    appointments: AppointmentWithDetails[],
    blockedDates: Date[]
  ): Array<{ date: Date; times: Array<{ time: string; available: boolean }> }> {
    const availability: Array<{ date: Date; times: Array<{ time: string; available: boolean }> }> = []
    const appointmentsByDate = this.groupAppointmentsByDate(appointments)

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateString = this.formatDateForComparison(currentDate)

      const isBlocked = blockedDates.some(blockedDate => this.formatDateForComparison(blockedDate) === dateString)

      if (isBlocked) {
        availability.push({
          date: new Date(currentDate),
          times: [],
        })
      } else {
        const dayAppointments = appointmentsByDate.get(dateString) || []
        const times = this.generateTimeSlotsForDay(dayAppointments)

        availability.push({
          date: new Date(currentDate),
          times,
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return availability
  }

  private generateTimeSlotsForDay(dayAppointments: AppointmentWithDetails[]): Array<{ time: string; available: boolean }> {
    const timeSlots: Array<{ time: string; available: boolean }> = []

    const availableTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

    const bookedTimes = new Set(dayAppointments.map(appointment => appointment.time))

    availableTimes.forEach(time => {
      timeSlots.push({
        time,
        available: !bookedTimes.has(time),
      })
    })

    return timeSlots
  }

  private groupAppointmentsByDate(appointments: AppointmentWithDetails[]): Map<string, AppointmentWithDetails[]> {
    const appointmentsByDate = new Map<string, AppointmentWithDetails[]>()

    appointments.forEach(appointment => {
      const dateString = this.formatDateForComparison(appointment.date)
      if (!appointmentsByDate.has(dateString)) {
        appointmentsByDate.set(dateString, [])
      }

      appointmentsByDate.get(dateString)!.push(appointment)
    })

    return appointmentsByDate
  }

  private formatDateForComparison(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private async countTotalDoctors(userRole: UserRole): Promise<void> {
    const total = await this.doctorRepository.countDoctors()
    usersTotal.set({ role: userRole }, total)
  }
}
