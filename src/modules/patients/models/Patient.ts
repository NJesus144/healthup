import { UserRole, UserStatus } from '@prisma/client'

export interface Patient {
  id?: string
  name: string
  email: string
  phone: string
  cpf: string
  role?: UserRole
  status?: UserStatus
  updatedAt?: Date
  createdAt?: Date
}
