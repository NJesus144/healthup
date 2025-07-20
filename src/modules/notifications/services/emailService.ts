import { emailsSent } from '@/metrics'
import { EmailData } from '@/modules/notifications/dtos/notification'
import { LogHelper } from '@/shared/utils/logHelpers'
import sgMail from '@sendgrid/mail'

const SENDGRID_TEMPLATES = {
  NEW_DOCTOR: 'd-d40d2bf544fb487fa52013e93e045357',
  NEW_APPOINTMENT: 'd-ca9ea16ef8944403bb36113c399bcfb7',
  CANCEL_APPOINTMENT: 'd-2ac074c1afd6481ca238260195fd3420',
  APPROVE_DOCTOR: 'd-881aed26fec040e49ce20a1d655b37ac',
  REJECT_DOCTOR: 'd-2c10ffe608314d23ba9adcbb355cd137',
} as const

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      await sgMail.send(emailData)
      LogHelper.logSuccess('email_sent_successfully', {
        data: emailData,
        statusCode: 200,
      })
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error(`Failed to send email: ${error}`)
    }
  }

  async sendNewDoctorEmail(doctorEmail: string, doctorName: string): Promise<void> {
    const emailData: EmailData = {
      to: doctorEmail,
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      templateId: SENDGRID_TEMPLATES.NEW_DOCTOR,
      dynamicTemplateData: {
        doctorName,
        registrationDate: new Date().toLocaleDateString('pt-BR'),
      },
    }

    await this.sendEmail(emailData)
    emailsSent.inc()
  }

  async sendNewAppointmentEmail(patientEmail: string, patientName: string, appointmentDate: string): Promise<void> {
    const emailData: EmailData = {
      to: patientEmail,
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      templateId: SENDGRID_TEMPLATES.NEW_APPOINTMENT || 'd-ca9ea16ef8944403bb36113c399bcfb7',
      dynamicTemplateData: {
        name: patientName,
        date: appointmentDate,
      },
    }

    await this.sendEmail(emailData)
    emailsSent.inc()
  }

  async sendNewApproveDoctorEmail(doctorEmail: string, doctorName: string): Promise<void> {
    const emailData: EmailData = {
      to: doctorEmail,
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      templateId: SENDGRID_TEMPLATES.APPROVE_DOCTOR || 'd-881aed26fec040e49ce20a1d655b37ac',
      dynamicTemplateData: {
        doctorName,
      },
    }

    await this.sendEmail(emailData)
    emailsSent.inc()
  }

  async sendNewRejectDoctorEmail(doctorEmail: string, doctorName: string): Promise<void> {
    const emailData: EmailData = {
      to: doctorEmail,
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      templateId: SENDGRID_TEMPLATES.REJECT_DOCTOR || 'd-2c10ffe608314d23ba9adcbb355cd137',
      dynamicTemplateData: {
        doctorName,
      },
    }

    await this.sendEmail(emailData)
    emailsSent.inc()
  }

  async sendCancelledAppointmentEmail(patientEmail: string, patientName: string, appointmentDate: string): Promise<void> {
    const emailData: EmailData = {
      to: patientEmail,
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      templateId: SENDGRID_TEMPLATES.CANCEL_APPOINTMENT,
      dynamicTemplateData: {
        name: patientName,
        date: appointmentDate,
      },
    }

    await this.sendEmail(emailData)
    emailsSent.inc()
  }
}

export default new EmailService()
