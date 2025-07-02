import { endOfDay, isSameDay, startOfDay } from 'date-fns'
import { AppointmentRepository } from '@/interfaces/repositories/AppointmentRepository '
import { AppointmentService } from '@/interfaces/services/AppointmentService'
import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { Appointment, AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { ConflictError, NotFoundError } from '@/shared/errors/AppError'
import { UpdateAppointmentDTO } from '@/modules/appointments/dtos/UpdateAppointmentDTO'
import { UserRole } from '@prisma/client'
import { fromZonedTime } from 'date-fns-tz'

export class AppointmentServiceImp implements AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async createAppointment(data: CreateAppointmentDTO): Promise<Appointment> {
    const isAvailable = await this.appointmentRepository.checkSlotAvailability(data.doctorId, data.date, data.time)

    if (!isAvailable) {
      throw new ConflictError('This time slot is already booked')
    }

    const appointmentDate = fromZonedTime(data.date, 'America/Sao_Paulo')
    const start = startOfDay(appointmentDate)
    const end = endOfDay(appointmentDate)

    const blockedDates = await this.appointmentRepository.getBlockedDates(data.doctorId, start, end)

    if (blockedDates.some(blocked => isSameDay(blocked, appointmentDate))) {
      throw new ConflictError('This date is blocked for the doctor')
    }

    return await this.appointmentRepository.createAppointment(data)
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

  async deleteAppointment(id: string): Promise<void> {
    const existingAppointment = await this.appointmentRepository.getAppointmentById(id)

    if (!existingAppointment) {
      throw new NotFoundError('Appointment not found')
    }

    await this.appointmentRepository.deleteAppointment(id)
  }

  async getMyAppointments(userId: string, userRole: UserRole): Promise<AppointmentWithDetails[]> {
    if (userRole !== UserRole.PATIENT && userRole !== UserRole.DOCTOR) {
      return []
    }

    return await this.appointmentRepository.getAppointmentsByUser(userId, userRole)
  }
}
