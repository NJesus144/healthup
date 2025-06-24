import { MedicalSpecialty, UserRole, UserStatus } from '@prisma/client'

export interface CreateDoctorDTO {
  name: string
  email: string
  passwordHash: string
  role?: UserRole
  status?: UserStatus
  phone: string
  cpf: string
  crm: string
  specialty: MedicalSpecialty
}
