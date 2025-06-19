import { CreatePatientDTO } from '@/modules/patients/dtos/CreatePatientDTO'
import { UpdatePatientDTO } from '@/modules/patients/dtos/UpdatePatientDTO'
import { Patient } from '@/modules/patients/models/Patient'
import { PrismaPatient } from '@/modules/patients/repositories/PatientRepository'

export interface PatientRepository{
  createPatient(CreatePatientDTO: CreatePatientDTO): Promise<Patient>
  getPatientById(id: string): Promise<Patient | null>
  updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient>
  findByEmail(email: string): Promise<PrismaPatient | null>
  findPatientByCPF(cpf: string): Promise<Patient | null>
}
