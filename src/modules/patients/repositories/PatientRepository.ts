import { prisma } from '@/config/prisma'
import { PatientRepository } from '@/interfaces/repositories/PatientRepository'
import { CreatePatientDTO } from '@/modules/patients/dtos/CreatePatientDTO'
import { UpdatePatientDTO } from '@/modules/patients/dtos/UpdatePatientDTO'
import { Patient } from '@/modules/patients/models/Patient'
import { UserRole, UserStatus } from '@prisma/client'

export interface PrismaPatient {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  role?: UserRole
  status?: UserStatus
  passwordHash: string
  updatedAt: Date
  createdAt: Date
}

export class PatientRepositoryImp implements PatientRepository {
  async createPatient(createPatientDTO: CreatePatientDTO): Promise<Patient> {
    const patient = await prisma.user.create({
      data: createPatientDTO,
    })

    return this.convertPatientData(patient)
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const patient = await prisma.user.findUnique({
      where: { id },
    })

    if (!patient) return null

    return this.convertPatientData(patient)
  }

  async updatePatient(id: string, updatePatientDTO: UpdatePatientDTO): Promise<Patient> {
    const patient = await prisma.user.update({
      where: { id },
      data: updatePatientDTO,
    })

    return this.convertPatientData(patient)
  }

  async findByEmail(email: string): Promise<PrismaPatient | null> {
    const patient = await prisma.user.findUnique({
      where: { email },
    })

    if (!patient) return null

    return {
      ...patient,
      updatedAt: patient.updatedAt,
      createdAt: patient.createdAt,
    }
  }

  async findPatientByCPF(cpf: string): Promise<Patient | null> {
    const patient = await prisma.user.findUnique({
      where: { cpf },
    })

    if (!patient) return null

    return this.convertPatientData(patient)
  }

  private convertPatientData(patient: PrismaPatient): Patient {
    const { passwordHash, ...patientWithoutPassword } = patient

    return {
      ...patientWithoutPassword,
      updatedAt: patient.updatedAt,
      createdAt: patient.createdAt,
    }
  }
}
