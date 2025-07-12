import { Job } from 'bullmq'
import { JobData } from '@/modules/notifications/dtos/notification'
import emailService from '@/modules/notifications/services/emailService'

export async function processNewDoctorEmail(job: Job<JobData>): Promise<void> {
  const { data } = job.data

  try {
    await emailService.sendNewDoctorEmail(data.doctorEmail, data.doctorName)
    console.log(`New doctor email processed successfully for: ${data.doctorEmail}`)
  } catch (error) {
    console.error('Error processing new doctor email:', error)
    throw error
  }
}
