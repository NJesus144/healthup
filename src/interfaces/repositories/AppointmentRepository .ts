import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { UpdateAppointmentDTO } from '@/modules/appointments/dtos/UpdateAppointmentDTO'
import { Appointment, AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { User, UserRole } from '@prisma/client'

export interface AppointmentRepository {
  createAppointment(data: CreateAppointmentDTO): Promise<Appointment>
  getAppointmentById(id: string): Promise<AppointmentWithDetails | null>
  updateAppointment(id: string, data: UpdateAppointmentDTO): Promise<Appointment>
  deleteAppointment(id: string): Promise<void>
  getAppointmentsByUser(userId: string, userRole: UserRole): Promise<AppointmentWithDetails[]>
  getOccupiedSlots(doctorId: string, startDate: Date, endDate: Date): Promise<{ date: Date; time: string }[]>
  checkSlotAvailability(doctorId: string, date: string, time: string): Promise<boolean>
  getBlockedDates(doctorId: string, startDate: Date, endDate: Date): Promise<Date[]>
  // getDoctorsBySpecialty(specialty?: string): Promise<User[]>
}
