import { z } from 'zod'
import { AppError } from '@/shared/errors/AppError'

const idSchema = z.string().cuid('Should be a valid UUID')

export function validateId(id: string): string {
  const result = idSchema.safeParse(id)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Invalid ID format'
    throw new AppError(errorMessage, 400)
  }

  return result.data
}
