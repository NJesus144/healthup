import { LoginDTO } from '@/modules/authentication/dtos/LoginDTO'
import { AppError } from '@/shared/errors/AppError'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export function validateLoginData(loginDTO: LoginDTO): LoginDTO {
  const result = loginSchema.safeParse(loginDTO)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  return {
    email: result.data.email.toLowerCase().trim(),
    password: result.data.password,
  }
}
