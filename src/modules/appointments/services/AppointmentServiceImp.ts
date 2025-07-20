import { endOfDay, format, formatISO, isSameDay, startOfDay } from 'date-fns'
import { AppointmentRepository } from '@/interfaces/repositories/AppointmentRepository '
import { AppointmentService } from '@/interfaces/services/AppointmentService'
import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { Appointment, AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { ConflictError, ForbiddenError, NotFoundError } from '@/shared/errors/AppError'
import { UpdateAppointmentDTO } from '@/modules/appointments/dtos/UpdateAppointmentDTO'
import { AppointmentStatus, UserRole } from '@prisma/client'
import { fromZonedTime } from 'date-fns-tz'
import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import notificationService from '@/modules/notifications/services/notificationService'
import { ptBR } from 'date-fns/locale'
import { appointmentsTotal, futureAppointmentsGauge } from '@/metrics'

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

    appointmentsTotal.inc({ status: appointment.status })

    await this.updateFutureAppointmentsGauge()

    const formattedDate = await this.formatedDate(appointment.date)

    await notificationService.sendNewAppointmentNotification(
      formattedDate,
      appointment.id,
      appointment.doctorId,
      appointment.patientEmail,
      appointment.patientName
    )

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

  async deleteAppointment(id: string, userId: string, role: UserRole): Promise<Appointment> {
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

    appointmentsTotal.inc({ status: 'cancelled' })

    await this.updateFutureAppointmentsGauge()

    const formattedDate = await this.formatedDate(appointment.date)

    await notificationService.sendCancelledAppointmentNotification(formattedDate, appointment.id, appointment.patientEmail, appointment.patientName)

    return appointment
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

  private async updateFutureAppointmentsGauge() {
    const today = new Date()
    const total = await this.appointmentRepository.countAppointments({
      date: { gte: startOfDay(today), lte: endOfDay(today) },
      status: AppointmentStatus.SCHEDULED,
    })

    futureAppointmentsGauge.set({ date: formatISO(today, { representation: 'date' }) }, total)
  }
}
