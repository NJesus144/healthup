import { Queue } from 'bullmq'
import { EmailType, JobData } from '@/modules/notifications/dtos/notification'
import redisClient from '@/lib/redis'

class EmailQueue {
  private queue: Queue

  constructor() {
    this.queue = new Queue('email-notifications', {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    })
  }

  async addNewDoctorJob(doctorEmail: string, doctorName: string): Promise<void> {
    const jobData: JobData = {
      type: EmailType.NEW_DOCTOR,
      data: {
        doctorEmail,
        doctorName,
      },
    }

    await this.queue.add('send-email', jobData, {
      priority: 2,
      delay: 0,
    })

    console.log(`New doctor email job added for: ${doctorEmail}`)
  }

  async addRejectedDoctorJob(doctorEmail: string, doctorName: string): Promise<void> {
    const jobData: JobData = {
      type: EmailType.REJECTED_DOCTOR,
      data: {
        doctorEmail,
        doctorName,
      },
    }

    await this.queue.add('send-email', jobData, {
      priority: 2,
      delay: 0,
    })

    console.log(`Rejected doctor email job added for: ${doctorEmail}`)
  }

  async addApprovedDoctorJob(doctorEmail: string, doctorName: string): Promise<void> {
    const jobData: JobData = {
      type: EmailType.APPROVED_DOCTOR,
      data: {
        doctorEmail,
        doctorName,
      },
    }

    await this.queue.add('send-email', jobData, {
      priority: 2,
      delay: 0,
    })

    console.log(`Approved doctor email job added for: ${doctorEmail}`)
  }

  async addNewAppointmentJob(appointmentDate: string, patientEmail?: string, patientName?: string): Promise<void> {
    const jobData: JobData = {
      type: EmailType.NEW_APPOINTMENT,
      data: {
        patientEmail,
        patientName,
        appointmentDate,
      },
    }

    await this.queue.add('send-email', jobData, {
      priority: 2,
      delay: 0,
    })

    console.log(`New appointment email job added for: ${patientEmail}`)
  }

  async addCancelledAppointmentJob(appointmentDate: string, patientEmail?: string, patientName?: string): Promise<void> {
    const jobData: JobData = {
      type: EmailType.CANCELLED_APPOINTMENT,
      data: {
        patientEmail,
        patientName,
        appointmentDate,
      },
    }

    await this.queue.add('send-email', jobData, {
      priority: 1,
      delay: 0,
    })

    console.log(`Cancelled appointment email job added for: ${patientEmail}`)
  }

  getQueue(): Queue {
    return this.queue
  }

  async close(): Promise<void> {
    await this.queue.close()
  }
}

export default new EmailQueue()
