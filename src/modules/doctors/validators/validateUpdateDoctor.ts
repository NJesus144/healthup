import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { AppError } from '@/shared/errors/AppError'
import { z } from 'zod'

const updateDoctorSchema = z.object({
  name: z.string().optional(),
})

export function validateUpdateDoctor(data: UpdateDoctorDTO): UpdateDoctorDTO {
  if (!data || Object.keys(data).length === 0) {
    throw new AppError('No data provided for update', 400)
  }

  const allowedFields = ['name']
  const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)))

  if (Object.keys(filteredData).length === 0) {
    throw new AppError('No valid fields provided for update. Allowed fields: name', 400)
  }
  const result = updateDoctorSchema.safeParse(filteredData)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  return result.data
}
