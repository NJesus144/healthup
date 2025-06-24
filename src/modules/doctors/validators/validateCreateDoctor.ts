import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { AppError } from '@/shared/errors/AppError'
import { MedicalSpecialty } from '@prisma/client'
import { z } from 'zod'

const createDoctorSchema = z.object({
  name: z.string().nonempty('Name is required').max(100, 'Name must be at most 100 characters long'),
  email: z.string().email('Invalid email format'),
  passwordHash: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().nonempty('Phone is required').max(15, 'Phone must be at most 15 characters long'),
  cpf: z.string().length(11, 'CPF must be exactly 11 characters long'),
  specialty: z.nativeEnum(MedicalSpecialty, {
    message: 'Specialty must be a valid medical specialty',
  }),
  crm: z.string().nonempty('CRM is required').max(20, 'CRM must be at most 20 characters long'),
})

export function validateCreateDoctor(createDoctorDTO: CreateDoctorDTO): CreateDoctorDTO {
  const result = createDoctorSchema.safeParse(createDoctorDTO)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  return result.data
}
