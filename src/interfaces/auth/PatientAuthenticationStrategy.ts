import { AuthenticatableEntity, AuthType } from '@/interfaces/auth/AuthenticableEntity'
import { AuthenticationStrategy } from '@/interfaces/auth/AuthenticationStrategy'
import { PatientService } from '@/interfaces/services/PatientService'
import { Patient } from '@/modules/patients/models/Patient'

type PatientWithPassword = Patient & { passwordHash?: string }

export class PatientAuthenticationStrategy implements AuthenticationStrategy {
  constructor(private readonly patientService: PatientService) {}

  async findByEmail(email: string): Promise<AuthenticatableEntity | null> {
    const patient = await this.patientService.getPatientByEmail(email)
    return patient ? this.mapToAuthenticatable(patient) : null
  }

  async findById(id: string): Promise<AuthenticatableEntity | null> {
    const patient = await this.patientService.getPatientById(id)
    return patient ? this.mapToAuthenticatable(patient) : null
  }

  getUserType(): AuthType {
    return AuthType.PATIENT
  }

  private mapToAuthenticatable(patient: PatientWithPassword): AuthenticatableEntity {
    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      passwordHash: patient.passwordHash ?? '',
    }
  }
}
