import { JobData } from '@/modules/notifications/dtos/notification'
import emailService from '@/modules/notifications/services/emailService'
import { Job } from 'bullmq'

export async function processApprovedDoctorEmail(job: Job<JobData>): Promise<void> {
  const { data } = job.data

  try {
    await emailService.sendNewApproveDoctorEmail(data.doctorEmail, data.doctorName)
    console.log(`Aprove doctor email processed successfully for: ${data.doctorEmail}`)
  } catch (error) {
    console.error('Error processing aprove doctor email:', error)
    throw error
  }
}
