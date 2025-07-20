import { JobData } from '@/modules/notifications/dtos/notification'
import emailService from '@/modules/notifications/services/emailService'
import { Job } from 'bullmq'

export async function processRejectedDoctorEmail(job: Job<JobData>): Promise<void> {
  const { data } = job.data

  try {
    await emailService.sendNewRejectDoctorEmail(data.doctorEmail, data.doctorName)
    console.log(`Reject doctor email processed successfully for: ${data.doctorEmail}`)
  } catch (error) {
    console.error('Error processing reject doctor email:', error)
    throw error
  }
}
