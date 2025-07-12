import { Job } from 'bullmq'
import { JobData } from '@/modules/notifications/dtos/notification'
import emailService from '@/modules/notifications/services/emailService'

export async function processNewAppointmentEmail(job: Job<JobData>): Promise<void> {
  const { data } = job.data

  try {
    await emailService.sendNewAppointmentEmail(data.patientEmail, data.patientName, data.appointmentDate)
    console.log(`New appointment email processed successfully for: ${data.patientEmail}`)
  } catch (error) {
    console.error('Error processing new appointment email:', error)
    throw error
  }
}
