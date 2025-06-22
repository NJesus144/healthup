import { MedicalSpecialty, UserRole, UserStatus } from '@prisma/client'

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  role?: UserRole
  status?: UserStatus
  updatedAt?: Date
  createdAt?: Date
  specialty: MedicalSpecialty | null
}
