import { UserStatus } from '@prisma/client'

export interface UpdateDoctorStatusDTO {
  status: UserStatus
}
