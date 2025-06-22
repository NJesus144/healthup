import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { CreateDoctorDTO } from '../../modules/doctors/dtos/CreateDoctorDTO'
import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { NotFoundError } from '@/shared/errors/AppError'
import { MedicalSpecialty, UserStatus } from '@prisma/client'

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
}
