import { CreatePatientDTO } from '@/modules/patients/dtos/CreatePatientDTO'
import { UpdatePatientDTO } from '@/modules/patients/dtos/UpdatePatientDTO'
import { Patient } from '@/modules/patients/models/Patient'
import { PrismaPatient } from '@/modules/patients/repositories/PatientRepository'

export interface PatientService {
  createPatient(createPatientDTO: CreatePatientDTO): Promise<Patient>
  getPatientById(id: string): Promise<Patient | null>
  updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient>
  getPatientByEmail(email: string): Promise<PrismaPatient | null>
}
