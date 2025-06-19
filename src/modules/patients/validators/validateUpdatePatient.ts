import { UpdatePatientDTO } from '@/modules/patients/dtos/UpdatePatientDTO'
import { AppError } from '@/shared/errors/AppError'
import { z } from 'zod'

const updatePatientSchema = z.object({
  name: z.string().optional(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters long')
    .optional(),
})

export function validateUpdatePatient(
  data: UpdatePatientDTO,
): UpdatePatientDTO {
  const result = updatePatientSchema.safeParse(data)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  return result.data
}
