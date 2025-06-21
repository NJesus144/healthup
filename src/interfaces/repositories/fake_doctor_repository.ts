import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { CreateDoctorDTO } from '@/modules/doctors/dtos/createDoctorDTO'
import { NotFoundError } from '@/shared/errors/AppError'
import { MedicalSpecialty, UserStatus } from '@prisma/client'

interface CreateDoctor extends CreateDoctorDTO {
  id: string
  createdAt: Date
  updatedAt: Date
}

export class FakeDoctorRepository implements DoctorRepository {
  private doctors: CreateDoctor[] = [
    {
      id: '1',
      name: 'Dr. João Silva',
      email: 'drjoaoSilva@gmail.com',
      specialty: MedicalSpecialty.CARDIOLOGIA,
      passwordHash: 'senha123',
      status: UserStatus.PENDING,
      cpf: '12345678901',
      crm: '123456-SP',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  async createDoctor(data: any): Promise<any> {
    const newDoctor = {
      ...data,
      id: String(this.doctors.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.doctors.push(newDoctor)
    return newDoctor
  }

  async getDoctorById(id: string): Promise<any | null> {
    return this.doctors.find(doctor => doctor.id === id) || null
  }

  async updateDoctor(id: string, data: Partial<any>): Promise<any> {
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

  async getDoctorsBySpecialty(specialty: string): Promise<any[]> {
    return this.doctors.filter(doctor => doctor.specialty === specialty)
  }

  async getAllDoctors(): Promise<any[]> {
    return this.doctors
  }
}
