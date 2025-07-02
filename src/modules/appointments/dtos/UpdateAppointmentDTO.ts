import { AppointmentStatus } from '@prisma/client'

export interface UpdateAppointmentDTO {
  notes?: string
  status?: AppointmentStatus
}
