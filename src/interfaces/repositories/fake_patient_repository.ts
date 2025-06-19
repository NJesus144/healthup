import { PatientRepository } from '@/interfaces/repositories/PatientRepository'
import { CreatePatientDTO } from '@/modules/patients/dtos/CreatePatientDTO'
import { UpdatePatientDTO } from '@/modules/patients/dtos/UpdatePatientDTO'
import { Patient } from '@/modules/patients/models/Patient'
import { NotFoundError } from '../../shared/errors/AppError'
import { PrismaPatient } from '@/modules/patients/repositories/PatientRepository'

export class FakePatientRepository implements PatientRepository {
  private patients: PrismaPatient[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@gmail.com',
      phone: '11999999999',
      passwordHash: 'senha123',
      cpf: '52998224725',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  async createPatient(data: CreatePatientDTO): Promise<PrismaPatient> {
    const newPatient = {
      ...data,
      id: Number(this.patients.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.patients.push(newPatient)
    return newPatient
  }

  async getPatientById(id: string): Promise<Patient | null> {
    return this.patients.find((patient) => patient.id === Number(id)) || null
  }

  async updatePatient(
    id: string,
    data: Partial<UpdatePatientDTO>,
  ): Promise<Patient> {
    const patientIndex = this.patients.findIndex((patient) => patient.id === Number(id))
    if (patientIndex === -1) {
     throw new NotFoundError('User not found')
    }

    return (this.patients[patientIndex] = {
      ...this.patients[patientIndex],
      ...data,
      updatedAt: new Date(),
    })
  }

  async findByEmail(email: string): Promise<PrismaPatient | null> {
    const patient = this.patients.find((patient) => patient.email === email)
    if (!patient) return null
    return {
      ...patient,
      id: patient.id ?? 0,
      passwordHash: '',
      role: undefined,
      status: undefined,
      updatedAt: patient.updatedAt || new Date(),
      createdAt: patient.createdAt || new Date(),
    }
  }

  async findPatientByCPF(cpf: string): Promise<Patient | null> {
    return this.patients.find((patient) => patient.cpf === cpf) || null
  }
}
