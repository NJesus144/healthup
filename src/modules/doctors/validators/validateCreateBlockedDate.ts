import { CreateBloquedDateDTO } from '@/modules/doctors/dtos/CreateBloquedDateDTO'
import { BadRequestError } from '@/shared/errors/AppError'
import { z } from 'zod'
import { fromZonedTime } from 'date-fns-tz'
import { addMonths, addDays, startOfDay, isAfter, isBefore, format } from 'date-fns'

const createBlockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  reason: z.string().optional(),
})

export function validateCreateBlockedDate(createBlockedDateDTO: CreateBloquedDateDTO): CreateBloquedDateDTO {
  const result = createBlockedDateSchema.safeParse(createBlockedDateDTO)

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Validation failed'
    throw new BadRequestError(errorMessage)
  }

  const validatedData = result.data
  const requestedDate = startOfDay(new Date(validatedData.date + 'T00:00:00'))

  const now = new Date()
  const formattedDate = fromZonedTime(now, 'America/Sao_Paulo')
  const todayStart = startOfDay(formattedDate)

  const minDate = addDays(todayStart, 1)
  const maxDate = addMonths(todayStart, 3)

  if (isBefore(requestedDate, minDate)) {
    const minDateFormatted = format(minDate, 'dd/MM/yyyy')
    throw new BadRequestError(`Cannot block dates with less than 24 hours in advance. Minimum date allowed: ${minDateFormatted}`)
  }

  if (isAfter(requestedDate, maxDate)) {
    const maxDateFormatted = format(maxDate, 'dd/MM/yyyy')
    throw new BadRequestError(`Cannot block dates beyond 3 months from today. Maximum date allowed: ${maxDateFormatted}`)
  }

  return {
    ...validatedData,
    date: format(requestedDate, 'yyyy-MM-dd'),
  }
}
