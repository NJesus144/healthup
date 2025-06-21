import { Patient } from '@/modules/patients/models/Patient'

export interface AuthenticationService {
  login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }>
  refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }>
  generateAccessToken(patient: Patient): string
  generateRefreshToken(patient: Patient): string
  verifyAccessToken(token: string): void
  verifyRefreshToken(token: string): void
}
