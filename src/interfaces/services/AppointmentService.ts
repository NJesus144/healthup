import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { UpdateAppointmentDTO } from '@/modules/appointments/dtos/UpdateAppointmentDTO'
import { Appointment, AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { UserRole } from '@prisma/client'

export interface AppointmentService {
  createAppointment(data: CreateAppointmentDTO): Promise<Appointment>
  getAppointmentById(id: string): Promise<AppointmentWithDetails>
  updateAppointment(id: string, data: UpdateAppointmentDTO): Promise<Appointment>
  deleteAppointment(id: string, userId: string, role: UserRole): Promise<void>
  getMyAppointments(userId: string, userRole: UserRole): Promise<AppointmentWithDetails[]>
}
