import { prisma } from '@/config/prisma'
import { AppointmentRepository } from '@/interfaces/repositories/AppointmentRepository '
import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { UpdateAppointmentDTO } from '@/modules/appointments/dtos/UpdateAppointmentDTO'
import { Appointment, AppointmentWithDetails } from '@/modules/appointments/models/Appointment'
import { AppointmentStatus, UserRole } from '@prisma/client'
import { parseISO } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'

export class AppointmentRepositoryImp implements AppointmentRepository {
  async createAppointment(data: CreateAppointmentDTO): Promise<Appointment> {
    const combined = `${data.date}T${data.time}`
    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        date: fromZonedTime(combined, 'America/Sao_Paulo'),
      },
    })

    return this.convertAppointmentData(appointment)
  }

  async getAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            crm: true,
          },
        },
      },
    })

    if (!appointment) return null

    return {
      ...this.convertAppointmentData(appointment),
      patient: appointment.patient,
      doctor: {
        ...appointment.doctor,
        specialty: appointment.doctor.specialty?.toString() || '',
        crm: appointment.doctor.crm ?? '',
      },
    }
  }

  async updateAppointment(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
    const appointment = await prisma.appointment.update({
      where: { id },
      data,
    })

    return this.convertAppointmentData(appointment)
  }

  async deleteAppointment(id: string): Promise<void> {
    await prisma.appointment.delete({
      where: { id },
    })
  }

  async getAppointmentsByUser(userId: string, userRole: UserRole): Promise<AppointmentWithDetails[]> {
    const whereCondition = userRole === UserRole.PATIENT ? { patientId: userId } : { doctorId: userId }

    const appointments = await prisma.appointment.findMany({
      where: whereCondition,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            crm: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    return appointments.map(appointment => ({
      ...this.convertAppointmentData(appointment),
      patient: appointment.patient,
      doctor: {
        ...appointment.doctor,
        specialty: appointment.doctor.specialty?.toString() || '',
        crm: appointment.doctor.crm ?? '',
      },
    }))
  }

  async getOccupiedSlots(doctorId: string, startDate: Date, endDate: Date): Promise<{ date: Date; time: string }[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
      select: {
        date: true,
        time: true,
      },
    })

    return appointments
  }

  async checkSlotAvailability(doctorId: string, date: string, time: string): Promise<boolean> {
    const appointment = await prisma.appointment.findUnique({
      where: {
        doctorId_date_time: {
          doctorId,
          date: parseISO(date),
          time,
        },
      },
    })
    console.log('Slot availability check:', { doctorId, date, time, appointment })

    return !appointment
  }

  // async getDoctorsBySpecialty(specialty?: string): Promise<User[]> {
  //   return await prisma.user.findMany({
  //     where: {
  //       role: UserRole.DOCTOR,
  //       status: UserStatus.ACTIVE,
  //       ...(specialty && { specialty: specialty as MedicalSpecialty }),
  //     },
  //   })
  // }

  private convertAppointmentData(appointment: any): Appointment {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    }
  }
}
