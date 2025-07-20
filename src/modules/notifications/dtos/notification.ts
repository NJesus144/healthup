export enum EmailType {
  NEW_DOCTOR = 'NEW_DOCTOR',
  NEW_APPOINTMENT = 'NEW_APPOINTMENT',
  CANCELLED_APPOINTMENT = 'CANCELLED_APPOINTMENT',
  REJECTED_DOCTOR = 'REJECTED_DOCTOR',
  APPROVED_DOCTOR = 'APPROVED_DOCTOR',
}

export interface EmailData {
  to: string
  from: string
  templateId: string
  dynamicTemplateData: Record<string, any>
}

export interface NewDoctorEmailData {
  doctorName: string
  doctorEmail: string
  registrationDate: string
}

export interface AppointmentEmailData {
  patientname: string
  patientEmail: string
  appointmentDate: string
}

export interface CancelledAppointmentEmailData {
  patientName: string
  patientEmail: string
  appointmentDate: string
}

export interface JobData {
  type: EmailType
  data: any
}

export interface QueueConfig {
  redis: {
    port: number
    host: string
    password?: string
  }
  defaultJobOptions: {
    attempts: number
    backoff: {
      type: string
      delay: number
    }
  }
}
