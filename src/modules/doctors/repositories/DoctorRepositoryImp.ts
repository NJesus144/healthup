import { prisma } from '@/config/prisma'
import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { CreateBloquedDateDTO } from '@/modules/doctors/dtos/CreateBloquedDateDTO'
import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { BlockedDate, MedicalSpecialty, UserRole, UserStatus } from '@prisma/client'

export interface PrismaDoctor {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  specialty: MedicalSpecialty | null
  status: UserStatus
  passwordHash: string
  crm: string | null
  updatedAt: Date
  createdAt: Date
}

export class DoctorRepositoryImp implements DoctorRepository {
  async createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<Doctor> {
    const doctor = await prisma.user.create({
      data: createDoctorDTO,
    })

    return this.convertDoctorData(doctor)
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    const doctor = await prisma.user.findUnique({
      where: { id },
    })

    if (!doctor) return null

    return this.convertDoctorData(doctor)
  }

  async updateDoctor(id: string, updateDoctorDTO: UpdateDoctorDTO): Promise<Doctor> {
    const doctor = await prisma.user.update({
      where: { id },
      data: updateDoctorDTO,
    })

    return this.convertDoctorData(doctor)
  }

  async findDoctorByCPF(cpf: string): Promise<Doctor | null> {
    const doctor = await prisma.user.findUnique({
      where: { cpf },
    })

    if (!doctor) return null

    return this.convertDoctorData(doctor)
  }

  async getDoctorByEmail(email: string): Promise<PrismaDoctor | null> {
    const doctor = await prisma.user.findUnique({
      where: { email },
    })

    if (!doctor) return null

    return {
      ...doctor,
      updatedAt: doctor.updatedAt,
      createdAt: doctor.createdAt,
    }
  }

  async findAllAvailableDoctors(filters: {
    specialty?: MedicalSpecialty
    status?: UserStatus
    pagination?: { page: number; limit: number }
  }): Promise<Doctor[]> {
    const queryOptions = {
      where: {
        role: UserRole.DOCTOR,
        status: filters.status || UserStatus.ACTIVE,
        ...(filters.specialty && { specialty: filters.specialty }),
      },
      orderBy: { createdAt: 'desc' as const },
      ...(filters.pagination && {
        skip: (filters.pagination.page - 1) * filters.pagination.limit,
        take: filters.pagination.limit,
      }),
    }
    const doctors = await prisma.user.findMany(queryOptions)
    return doctors.map(doctor => this.convertDoctorData(doctor))
  }

  private convertDoctorData(doctor: PrismaDoctor): Doctor {
    const { passwordHash, ...patientWithoutPassword } = doctor

    return {
      ...patientWithoutPassword,
      updatedAt: doctor.updatedAt,
      createdAt: doctor.createdAt,
    }
  }

  async getBlockedDates(doctorId: string, startDate: Date, endDate: Date): Promise<Date[]> {
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        doctorId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
      },
    })

    return blockedDates.map(blocked => blocked.date)
  }

  async cancelBlockedDate(doctorId: string, date: Date): Promise<BlockedDate> {
    const blockedDate = await prisma.blockedDate.delete({
      where: {
        doctorId_date: {
          doctorId,
          date,
        },
      },
    })

    return blockedDate
  }

  async blockedDate(doctorId: string, createBloquedDateDTO: CreateBloquedDateDTO): Promise<BlockedDate> {
    const blockedDate = await prisma.blockedDate.create({
      data: {
        doctorId,
        date: createBloquedDateDTO.date,
        reason: createBloquedDateDTO.reason || null,
      },
    })

    return blockedDate
  }

  async getAllBlockedDates(doctorId: string): Promise<Date[]> {
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        doctorId,
      },
      select: {
        date: true,
      },
    })

    return blockedDates.map(blocked => blocked.date)
  }
}
