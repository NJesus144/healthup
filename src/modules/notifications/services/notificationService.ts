import emailQueue from '@/modules/notifications/jobs/emailQueue'
import { LogHelper } from '@/shared/utils/logHelpers'

class NotificationService {
  async sendNewDoctorNotification(doctorEmail: string, doctorName: string, doctorId: string): Promise<void> {
    try {
      await emailQueue.addNewDoctorJob(doctorEmail, doctorName)
      LogHelper.logNotification('email_sent', {
        email: doctorEmail,
        doctorId,
        action: 'doctor_registration',
      })
    } catch (error) {
      LogHelper.logNotification('email_failed', {
        email: doctorEmail,
        doctorId,
        action: 'doctor_registration',
        error: (error as Error).message,
      })
      throw error
    }
  }

  async sendNewAppointmentNotification(
    appointmentDate: string,
    appointmentId: string,
    doctorId: string,
    patientEmail?: string,
    patientName?: string
  ): Promise<void> {
    try {
      await emailQueue.addNewAppointmentJob(appointmentDate, patientEmail, patientName)
      LogHelper.logNotification('email_sent', {
        email: patientEmail,
        appointmentId,
        doctorId,
        action: 'appointment_confirmation',
      })
    } catch (error) {
      LogHelper.logNotification('email_failed', {
        email: patientEmail,
        appointmentId,
        doctorId,
        action: 'appointment_confirmation',
        error: (error as Error).message,
      })
      throw error
    }
  }

  async sendCancelledAppointmentNotification(appointmentDate: string, appointmentId: string, patientEmail?: string, patientName?: string): Promise<void> {
    try {
      await emailQueue.addCancelledAppointmentJob(appointmentDate, patientEmail, patientName)
      LogHelper.logNotification('email_sent', {
        email: patientEmail,
        appointmentId,
        action: 'appointment_cancellation',
      })
    } catch (error) {
      LogHelper.logNotification('email_failed', {
        email: patientEmail,
        appointmentId,
        action: 'appointment_cancellation',
        error: (error as Error).message,
      })
      throw error
    }
  }

  async sendRejectedDoctorNotification(doctorEmail: string, doctorName: string): Promise<void> {
    try {
      await emailQueue.addRejectedDoctorJob(doctorEmail, doctorName)
      LogHelper.logNotification('email_sent', {
        email: doctorEmail,
        action: 'doctor_rejection',
      })
    } catch (error) {
      LogHelper.logNotification('email_failed', {
        email: doctorName,
        action: 'doctor_rejection',
        error: (error as Error).message,
      })
      throw error
    }
  }

  async sendApprovedDoctorNotification(doctorEmail: string, doctorName: string): Promise<void> {
    try {
      console.log('Sending approved doctor notification to:', doctorEmail, doctorName)
      await emailQueue.addApprovedDoctorJob(doctorEmail, doctorName)
      LogHelper.logNotification('email_sent', {
        email: doctorEmail,
        action: 'doctor_approval',
      })
    } catch (error) {
      LogHelper.logNotification('email_failed', {
        email: doctorName,
        action: 'doctor_approval',
        error: (error as Error).message,
      })
      throw error
    }
  }
}

export default new NotificationService()
