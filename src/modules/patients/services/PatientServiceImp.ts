import { PatientRepository } from '@/interfaces/repositories/PatientRepository'
import { PatientService } from '@/interfaces/services/PatientService'
import { CreatePatientDTO } from '@/modules/patients/dtos/CreatePatientDTO'
import { UpdatePatientDTO } from '@/modules/patients/dtos/UpdatePatientDTO'
import { Patient } from '@/modules/patients/models/Patient'
import bcrypt from 'bcrypt'
import { PrismaPatient } from '@/modules/patients/repositories/PatientRepository'
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/AppError'
import { DocumentValidator } from '@/shared/utils/documentValidator'

export class PatientServiceImp implements PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async createPatient(createPatientDTO: CreatePatientDTO): Promise<Patient> {
    if (!DocumentValidator.validateCPF(createPatientDTO.cpf)) throw new BadRequestError('Invalid CPF format')

    const existingCPF = await this.getPatientByCPF(createPatientDTO.cpf)

    if (existingCPF) throw new ConflictError('CPF already exists')

    const existingPatient = await this.getPatientByEmail(createPatientDTO.email)

    if (existingPatient) throw new ConflictError('Email already exists')

    const passwordHash = await bcrypt.hash(createPatientDTO.passwordHash, 10)
    const patientData = {
      ...createPatientDTO,
      passwordHash,
    }

    return this.patientRepository.createPatient(patientData)
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const patient = await this.patientRepository.getPatientById(id)

    if (!patient) throw new NotFoundError('User not found')

    return patient
  }

  async getPatientByEmail(email: string): Promise<PrismaPatient | null> {
    const patient = await this.patientRepository.findByEmail(email)
    return patient
  }

  async updatePatient(id: string, updatePatientDTO: UpdatePatientDTO): Promise<Patient> {
    const patient = await this.getPatientById(id)

    if (!patient) throw new NotFoundError('User not found')

    return await this.patientRepository.updatePatient(id, updatePatientDTO)
  }

  private async getPatientByCPF(cpf: string): Promise<Patient | null> {
    return this.patientRepository.findPatientByCPF(cpf)
  }
}
