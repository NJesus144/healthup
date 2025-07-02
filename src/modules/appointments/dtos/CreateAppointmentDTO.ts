export interface CreateAppointmentDTO {
  patientId: string
  doctorId: string
  date: string
  time: string
  notes?: string
}
