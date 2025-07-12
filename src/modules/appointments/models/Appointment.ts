import { AppointmentStatus, MedicalSpecialty } from '@prisma/client'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: Date
  time: string
  notes?: string
  status: AppointmentStatus
  patientName?: string
  patientEmail?: string
  createdAt: Date
  updatedAt: Date
}

export interface AppointmentWithDetails extends Appointment {
  patient: {
    id: string
    name: string
    email: string
    phone: string
  }
  doctor: {
    id: string
    name: string
    specialty: string
    crm: string
  }
}

export interface AvailableSlot {
  date: string
  time: string
  available: boolean
}

export interface DoctorAvailability {
  doctorId: string
  doctorName: string
  specialty: MedicalSpecialty
  availableSlots: AvailableSlot[]
}
