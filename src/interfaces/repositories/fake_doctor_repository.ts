import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { NotFoundError } from '@/shared/errors/AppError'
import { BlockedDate, MedicalSpecialty, UserStatus } from '@prisma/client'

export class FakeDoctorRepository implements DoctorRepository {
  private doctors: PrismaDoctor[] = [
    {
      id: '1',
      name: 'Dr. João Silva',
      email: 'drjoaoSilva@gmail.com',
      specialty: MedicalSpecialty.CARDIOLOGY,
      phone: '11999999999',
      passwordHash: 'senha123',
      status: UserStatus.PENDING,
      cpf: '38823074045',
      crm: '123456-SP',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  private blockedDates: BlockedDate[] = []

  async createDoctor(data: CreateDoctorDTO): Promise<Doctor> {
    const newDoctor = {
      ...data,
      id: String(this.doctors.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: data.status ?? UserStatus.PENDING,
    }
    this.doctors.push(newDoctor)
    return newDoctor
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    return this.doctors.find(doctor => doctor.id === id) || null
  }

  async updateDoctor(id: string, data: Partial<UpdateDoctorDTO>): Promise<Doctor> {
    const doctorIndex = this.doctors.findIndex(doctor => doctor.id === id)
    if (doctorIndex === -1) {
      throw new NotFoundError('Doctor not found')
    }

    return (this.doctors[doctorIndex] = {
      ...this.doctors[doctorIndex],
      ...data,
      updatedAt: new Date(),
    })
  }

  async findAllAvailableDoctors(): Promise<Doctor[]> {
    return this.doctors
  }

  async findDoctorByCPF(cpf: string): Promise<Doctor | null> {
    return this.doctors.find(doctor => doctor.cpf === cpf) || null
  }

  async getDoctorByEmail(email: string): Promise<PrismaDoctor | null> {
    const doctor = this.doctors.find(doctor => doctor.email === email)
    if (!doctor) return null
    return {
      ...doctor,
      status: doctor.status ?? UserStatus.PENDING,
    } as PrismaDoctor
  }

  async blockedDate(doctorId: string, date: Date, reason?: string): Promise<BlockedDate> {
    const newBlockedDate: BlockedDate = {
      id: String(this.blockedDates.length + 1),
      doctorId,
      date,
      reason: reason || null,
      createdAt: new Date(),
    }

    this.blockedDates.push(newBlockedDate)
    return newBlockedDate
  }

  async getBlockedDates(doctorId: string, startDate: Date, endDate: Date): Promise<Date[]> {
    return this.blockedDates
      .filter(blocked => {
        const blockedDateOnly = new Date(blocked.date.toISOString().split('T')[0])
        const startDateOnly = new Date(startDate.toISOString().split('T')[0])
        const endDateOnly = new Date(endDate.toISOString().split('T')[0])

        return blocked.doctorId === doctorId && blockedDateOnly >= startDateOnly && blockedDateOnly <= endDateOnly
      })
      .map(blocked => blocked.date)
  }

  async cancelBlockedDate(doctorId: string, date: Date): Promise<BlockedDate> {
    const dateString = date.toISOString().split('T')[0]
    const blockedDateIndex = this.blockedDates.findIndex(blocked => blocked.doctorId === doctorId && blocked.date.toISOString().split('T')[0] === dateString)

    if (blockedDateIndex === -1) {
      throw new NotFoundError('Blocked date not found')
    }

    const [canceledDate] = this.blockedDates.splice(blockedDateIndex, 1)
    return canceledDate
  }

  async getAllBlockedDates(doctorId: string): Promise<Date[]> {
    return this.blockedDates.filter(blocked => blocked.doctorId === doctorId).map(blocked => blocked.date)
  }

  async countDoctors(where?: Record<string, any>): Promise<number> {
    return this.doctors.filter(doctor => {
      if (where) {
        return Object.entries(where).every(([key, value]) => doctor[key as keyof PrismaDoctor] === value)
      }
      return true
    }).length
  }
}
