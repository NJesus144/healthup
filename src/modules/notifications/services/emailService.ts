import { EmailData } from '@/modules/notifications/dtos/notification'
import sgMail from '@sendgrid/mail'

const SENDGRID_TEMPLATES = {
  NEW_DOCTOR: 'd-d40d2bf544fb487fa52013e93e045357',
  NEW_APPOINTMENT: 'd-ca9ea16ef8944403bb36113c399bcfb7',
  CANCEL_APPOINTMENT: 'd-2ac074c1afd6481ca238260195fd3420',
} as const

class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      await sgMail.send(emailData)
      console.log(`Email sent successfully to ${emailData.to}`)
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
  }
}

export default new EmailService()
