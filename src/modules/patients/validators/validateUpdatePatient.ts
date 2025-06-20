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
  if (!data || Object.keys(data).length === 0) {
    throw new AppError('No data provided for update', 400)
  }

  const allowedFields = ['name', 'phone']
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedFields.includes(key)),
  )

  if (Object.keys(filteredData).length === 0) {
    throw new AppError('No valid fields provided for update. Allowed fields: name, phone', 400)
  }

  const result = updatePatientSchema.safeParse(filteredData)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  return result.data
}
