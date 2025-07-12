import emailQueue from '@/modules/notifications/jobs/emailQueue'

class NotificationService {
  async sendNewDoctorNotification(doctorEmail: string, doctorName: string): Promise<void> {
    try {
      await emailQueue.addNewDoctorJob(doctorEmail, doctorName)
      console.log(`New doctor notification queued for: ${doctorEmail}`)
    } catch (error) {
      console.error('Error queueing new doctor notification:', error)
      throw error
    }
  }

  async sendNewAppointmentNotification(appointmentDate: string, patientEmail?: string, patientName?: string): Promise<void> {
    try {
      await emailQueue.addNewAppointmentJob(appointmentDate, patientEmail, patientName)
      console.log(`New appointment notification queued for: ${patientEmail}`)
    } catch (error) {
      console.error('Error queueing new appointment notification:', error)
      throw error
    }
  }

  async sendCancelledAppointmentNotification(appointmentDate: string, patientEmail?: string, patientName?: string): Promise<void> {
    try {
      await emailQueue.addCancelledAppointmentJob(appointmentDate, patientEmail, patientName)
      console.log(`Cancelled appointment notification queued for: ${patientEmail}`)
    } catch (error) {
      console.error('Error queueing cancelled appointment notification:', error)
      throw error
    }
  }
}

export default new NotificationService()
