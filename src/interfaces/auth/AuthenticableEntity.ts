export interface AuthenticatableEntity {
  id: string
  name: string
  email: string
  passwordHash: string
}

export enum AuthType {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}
