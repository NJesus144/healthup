import { z } from 'zod'
import { AppError } from '@/shared/errors/AppError'

const getDoctorAvailabilitySchema = z.object({
  doctorId: z.string().nonempty('Doctor ID is required'),
})

export function validateGetDoctorAvailability(params: { doctorId: string }): { doctorId: string } {
  const result = getDoctorAvailabilitySchema.safeParse(params)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  return result.data
}
