import { BadRequestError, ForbiddenError } from '@/shared/errors/AppError'
import { UserRole } from '@prisma/client'

export function validateUpdateDoctorStatus(data: any) {
  if (!data.status) {
    throw new BadRequestError('Status is required')
  }

  if (!['ACTIVE', 'REJECTED'].includes(data.status)) {
    throw new BadRequestError('Status must be ACTIVE or REJECTED')
  }

  return {
    status: data.status as 'ACTIVE' | 'REJECTED',
  }
}

export function validateIfUserIsAdmin(userRole: UserRole) {
  if (userRole !== UserRole.ADMIN) {
    throw new ForbiddenError('User is not an admin')
  }
}
