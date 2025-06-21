import { CreatePatientDTO } from '@/modules/patients/dtos/CreatePatientDTO'
import { AppError } from '@/shared/errors/AppError'
import { z } from 'zod'

const createPatientSchema = z.object({
  name: z.string().nonempty('Name is required').max(100, 'Name must be at most 100 characters long'),
  email: z.string().email('Invalid email format'),
  passwordHash: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters long'),
  cpf: z.string().length(11, 'CPF must be exactly 11 characters long'),
})

export function validateCreatePatient(createPatientDTO: CreatePatientDTO): CreatePatientDTO {
  const result = createPatientSchema.safeParse(createPatientDTO)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  return result.data
}
