import { Worker } from 'bullmq'
import { processNewDoctorEmail } from '@/modules/notifications/jobs/processors/newDoctorProcessor'
import { EmailType, JobData } from '@/modules/notifications/dtos/notification'
import redisClient from '@/lib/redis'
import { processNewAppointmentEmail } from '@/modules/notifications/jobs/processors/newAppointmentProcessos'
import { processCancelledAppointmentEmail } from '@/modules/notifications/jobs/processors/cancelledAppointmentProcessor'

class NotificationWorker {
  private worker: Worker

  constructor() {
    this.worker = new Worker('email-notifications', this.processJob, {
      connection: redisClient,
      concurrency: 5,
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 5 },
    })

    this.setupEventListeners()
  }

  private async processJob(job: any): Promise<void> {
    const jobData: JobData = job.data

    console.log(`Processing job: ${jobData.type}`)

    switch (jobData.type) {
      case EmailType.NEW_DOCTOR:
        await processNewDoctorEmail(job)
        break
      case EmailType.NEW_APPOINTMENT:
        await processNewAppointmentEmail(job)
        break
      case EmailType.CANCELLED_APPOINTMENT:
        await processCancelledAppointmentEmail(job)
        break
      default:
        throw new Error(`Unknown job type: ${jobData.type}`)
    }
  }

  private setupEventListeners(): void {
    this.worker.on('completed', job => {
      console.log(`Job ${job.id} completed successfully`)
    })

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err)
    })

    this.worker.on('error', err => {
      console.error('Worker error:', err)
    })
  }

  async close(): Promise<void> {
    await this.worker.close()
  }
}

export default NotificationWorker
