import { AppointmentRepository } from '@/interfaces/repositories/AppointmentRepository '
import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { UpdateAppointmentDTO } from '@/modules/appointments/dtos/UpdateAppointmentDTO'
import { Appointment, AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { UserRole, AppointmentStatus, MedicalSpecialty } from '@prisma/client'
import { isSameDay, parseISO } from 'date-fns'

export class FakeAppointmentRepository implements AppointmentRepository {
  private appointments: AppointmentWithDetails[] = [
    {
      id: '1',
      patientId: 'patient-1',
      doctorId: 'doctor-1',
      date: parseISO('2024-12-01'),
      time: '09:00',
      status: AppointmentStatus.SCHEDULED,
      notes: 'Consulta de rotina',
      createdAt: new Date(),
      updatedAt: new Date(),
      patient: {
        id: 'patient-1',
        name: 'João Silva',
        email: 'joao@gmail.com',
        phone: '11999999999',
      },
      doctor: {
        id: 'doctor-1',
        name: 'Dr. Maria Santos',
        specialty: MedicalSpecialty.CARDIOLOGY,
        crm: 'CRM-123456',
      },
    },
    {
      id: '2',
      patientId: 'patient-2',
      doctorId: 'doctor-1',
      date: parseISO('2024-12-01'),
      time: '10:00',
      status: AppointmentStatus.SCHEDULED,
      notes: 'Consulta de rotina',
      createdAt: new Date(),
      updatedAt: new Date(),
      patient: {
        id: 'patient-2',
        name: 'Maria Clara',
        email: 'maria@gmail.com',
        phone: '11777777777',
      },
      doctor: {
        id: 'doctor-1',
        name: 'Dr. Maria Santos',
        specialty: MedicalSpecialty.CARDIOLOGY,
        crm: 'CRM-123456',
      },
    },
  ]

  private blockedDates: Date[] = [parseISO('2024-12-25'), parseISO('2024-12-31')]

  async createAppointment(data: CreateAppointmentDTO): Promise<Appointment> {
    const newAppointment: Appointment = {
      id: String(this.appointments.length + 1),
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: parseISO(data.date),
      time: data.time,
      status: AppointmentStatus.SCHEDULED,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const appointmentWithDetails: AppointmentWithDetails = {
      ...newAppointment,
      patient: {
        id: data.patientId,
        name: 'Test Patient',
        email: 'test@gmail.com',
        phone: '11999999999',
      },
      doctor: {
        id: data.doctorId,
        name: 'Test Doctor',
        specialty: MedicalSpecialty.CARDIOLOGY,
        crm: 'CRM-123456',
      },
    }

    this.appointments.push(appointmentWithDetails)
    return newAppointment
  }

  async getAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
    return this.appointments.find(appointment => appointment.id === id) || null
  }

  async updateAppointment(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
    const appointmentIndex = this.appointments.findIndex(appointment => appointment.id === id)

    if (appointmentIndex === -1) {
      throw new Error('Appointment not found')
    }

    const updatedAppointment = {
      ...this.appointments[appointmentIndex],
      ...data,
      updatedAt: new Date(),
    }

    this.appointments[appointmentIndex] = updatedAppointment

    return {
      id: updatedAppointment.id,
      patientId: updatedAppointment.patientId,
      doctorId: updatedAppointment.doctorId,
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    const appointmentIndex = this.appointments.findIndex(appointment => appointment.id === id)

    if (appointmentIndex === -1) {
      throw new Error('Appointment not found')
    }

    this.appointments.splice(appointmentIndex, 1)
  }

  async checkSlotAvailability(doctorId: string, date: string, time: string): Promise<boolean> {
    const existingAppointment = this.appointments.find(
      appointment =>
        appointment.doctorId === doctorId &&
        appointment.date.toISOString().split('T')[0] === date &&
        appointment.time === time &&
        appointment.status !== AppointmentStatus.CANCELLED
    )

    return !existingAppointment
  }

  async getBlockedDates(doctorId: string, startDate: Date, endDate: Date): Promise<Date[]> {
    return this.blockedDates.filter(blockedDate => {
      return isSameDay(blockedDate, startDate) || isSameDay(blockedDate, endDate) || (blockedDate >= startDate && blockedDate <= endDate)
    })
  }

  async getAppointmentsByUser(userId: string, userRole: UserRole): Promise<AppointmentWithDetails[]> {
    if (userRole === UserRole.PATIENT) {
      return this.appointments.filter(appointment => appointment.patientId === userId)
    }

    if (userRole === UserRole.DOCTOR) {
      return this.appointments.filter(appointment => appointment.doctorId === userId)
    }

    return []
  }

  async getOccupiedSlots(doctorId: string, startDate: Date, endDate: Date): Promise<{ date: Date; time: string }[]> {
    return this.appointments
      .filter(appointment => appointment.doctorId === doctorId && appointment.date >= startDate && appointment.date <= endDate)
      .map(appointment => ({ date: appointment.date, time: appointment.time }))
  }
}
