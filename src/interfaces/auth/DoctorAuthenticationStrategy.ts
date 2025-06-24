import { AuthenticatableEntity, AuthType } from '@/interfaces/auth/AuthenticableEntity'
import { AuthenticationStrategy } from '@/interfaces/auth/AuthenticationStrategy'
import { DoctorService } from '@/interfaces/services/DoctorService'
import { Doctor } from '@/modules/doctors/models/Doctor'

type PatientWithPassword = Doctor & { passwordHash?: string }

export class DoctorAuthenticationStrategy implements AuthenticationStrategy {
  constructor(private readonly doctorService: DoctorService) {}

  async findByEmail(email: string): Promise<AuthenticatableEntity | null> {
    const doctor = await this.doctorService.getDoctorByEmail(email)
    return doctor ? this.mapToAuthenticatable(doctor) : null
  }

  async findById(id: string): Promise<AuthenticatableEntity | null> {
    const doctor = await this.doctorService.getDoctorById(id)
    return doctor ? this.mapToAuthenticatable(doctor) : null
  }

  getUserType(): AuthType {
    return AuthType.DOCTOR
  }

  private mapToAuthenticatable(doctor: PatientWithPassword): AuthenticatableEntity {
    return {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      passwordHash: doctor.passwordHash ?? '',
    }
  }
}
