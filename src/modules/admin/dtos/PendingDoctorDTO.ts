export interface PendingDoctorDTO {
  id: string
  name: string
  email: string
  specialization: string
  phone: string
  crm: string
  createdAt: Date
  status: 'PENDING'
}
