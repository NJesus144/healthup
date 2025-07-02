import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { AppError } from '@/shared/errors/AppError'
import { z } from 'zod'
import { isValid, parseISO, isAfter, startOfDay } from 'date-fns'

const createAppointmentSchema = z.object({
  patientId: z.string().cuid('Patient ID must be a valid'),
  doctorId: z.string().cuid('Doctor ID must be a valid'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
  notes: z.string().optional(),
})

export function validateCreateAppointment(data: CreateAppointmentDTO): CreateAppointmentDTO {
  const result = createAppointmentSchema.safeParse(data)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new AppError(errorMessage, 400)
  }

  const appointmentDate = parseISO(data.date)
  if (!isValid(appointmentDate)) {
    throw new AppError('Invalid date format', 400)
  }

  if (!isAfter(appointmentDate, startOfDay(new Date()))) {
    throw new AppError('Appointment date must be in the future', 400)
  }

  const validTimes = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
  ]

  if (!validTimes.includes(data.time)) {
    throw new AppError('Invalid time slot. Available times: 09:00 to 16:30 (30min intervals)', 400)
  }

  return result.data
}
