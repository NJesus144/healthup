import { JobData } from '@/modules/notifications/dtos/notification'
import emailService from '@/modules/notifications/services/emailService'
import { Job } from 'bullmq'

export async function processCancelledAppointmentEmail(job: Job<JobData>): Promise<void> {
  const { data } = job.data

  try {
    await emailService.sendCancelledAppointmentEmail(data.patientEmail, data.patientName, data.appointmentDate)
    console.log(`Cancelled appointment email processed successfully for: ${data.patientEmail}`)
  } catch (error) {
    console.error('Error processing cancelled appointment email:', error)
    throw error
  }
}
