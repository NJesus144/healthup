import { endOfDay, format, isSameDay, startOfDay } from 'date-fns'
import { AppointmentRepository } from '@/interfaces/repositories/AppointmentRepository '
import { AppointmentService } from '@/interfaces/services/AppointmentService'
import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { Appointment, AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/errors/AppError'
import { UpdateAppointmentDTO } from '@/modules/appointments/dtos/UpdateAppointmentDTO'
import { UserRole } from '@prisma/client'
import { fromZonedTime } from 'date-fns-tz'
import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import notificationService from '@/modules/notifications/services/notificationService'
import { ptBR } from 'date-fns/locale'

export class AppointmentServiceImp implements AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorRepository: DoctorRepository
  ) {}

  async createAppointment(data: CreateAppointmentDTO): Promise<Appointment> {
    const isAvailable = await this.appointmentRepository.checkSlotAvailability(data.doctorId, data.date, data.time)

    if (!isAvailable) {
      throw new ConflictError('This time slot is already booked')
    }

    const appointmentDate = fromZonedTime(data.date, 'America/Sao_Paulo')
    const start = startOfDay(appointmentDate)
    const end = endOfDay(appointmentDate)

    const blockedDates = await this.doctorRepository.getBlockedDates(data.doctorId, start, end)

    if (blockedDates.some(blocked => isSameDay(blocked, appointmentDate))) {
      throw new ConflictError('This date is blocked for the doctor')
    }

    const appointment = await this.appointmentRepository.createAppointment(data)

    const formattedDate = await this.formatedDate(appointment.date)

    await notificationService.sendNewAppointmentNotification(formattedDate, appointment.patientEmail, appointment.patientName)

    return appointment
  }

  async getAppointmentById(id: string): Promise<AppointmentWithDetails> {
    const appointment = await this.appointmentRepository.getAppointmentById(id)

    if (!appointment) {
      throw new NotFoundError('Appointment not found')
    }

    return appointment
  }

  async updateAppointment(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
    const existingAppointment = await this.appointmentRepository.getAppointmentById(id)

    if (!existingAppointment) {
      throw new NotFoundError('Appointment not found')
    }

    return await this.appointmentRepository.updateAppointment(id, data)
  }

  async deleteAppointment(id: string, userId: string, role: UserRole): Promise<void> {
    const existingAppointment = await this.appointmentRepository.getAppointmentById(id)

    if (!existingAppointment) {
      throw new NotFoundError('Appointment not found')
    }

    const isPatient = existingAppointment.patientId === userId && role === UserRole.PATIENT
    const isDoctor = existingAppointment.doctorId === userId && role === UserRole.DOCTOR

    if (!isPatient && !isDoctor) {
      throw new ForbiddenError('You do not have permission to delete this appointment')
    }

    const appointment = await this.appointmentRepository.deleteAppointment(id)

    const formattedDate = await this.formatedDate(appointment.date)

    await notificationService.sendCancelledAppointmentNotification(formattedDate, appointment.patientEmail, appointment.patientName)
  }

  async getMyAppointments(userId: string, userRole: UserRole): Promise<AppointmentWithDetails[]> {
    if (userRole !== UserRole.PATIENT && userRole !== UserRole.DOCTOR) {
      return []
    }

    return await this.appointmentRepository.getAppointmentsByUser(userId, userRole)
  }

  private async formatedDate(date: Date): Promise<string> {
    return format(date, "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    })
  }
}
