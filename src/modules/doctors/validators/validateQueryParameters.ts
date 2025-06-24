import { AppError } from '@/shared/errors/AppError'
import { MedicalSpecialty, UserStatus } from '@prisma/client'
import { z } from 'zod'

const MedicalSpecialtyEnum = z.nativeEnum(MedicalSpecialty)
const UserStatusEnum = z.nativeEnum(UserStatus)

export interface GetDoctorsQueryDTO {
  specialty?: MedicalSpecialty
  status?: UserStatus
  page?: number
  limit?: number
}

const getDoctorsQuerySchema = z.object({
  specialty: MedicalSpecialtyEnum.optional(),
  status: UserStatusEnum.optional(),
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined))
    .refine(val => val === undefined || val > 0, {
      message: 'Page must be greater than 0',
    }),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined))
    .refine(val => val === undefined || (val > 0 && val <= 100), {
      message: 'Limit must be between 1 and 100',
    }),
})

export function validateGetDoctorsQuery(queryParams: any): GetDoctorsQueryDTO {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return {}
  }

  const allowedFields = ['specialty', 'status', 'page', 'limit']
  const filteredData = Object.fromEntries(Object.entries(queryParams).filter(([key]) => allowedFields.includes(key)))
  const result = getDoctorsQuerySchema.safeParse(filteredData)

  if (!result.success) {
    const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')

    throw new AppError(`Validation failed: ${errorMessages}`, 400)
  }

  return result.data
}
