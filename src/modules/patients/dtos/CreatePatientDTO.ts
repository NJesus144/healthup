import { UserRole, UserStatus } from "@prisma/client"

export interface CreatePatientDTO {
  name: string
  email: string
  passwordHash: string
  role?: UserRole
  status?: UserStatus
  phone: string
  cpf: string
}
