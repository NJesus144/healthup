import { AuthenticatableEntity, AuthType } from '@/interfaces/auth/AuthenticableEntity'

export interface AuthenticationService {
  login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }>
  refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }>
  generateAccessToken(user: AuthenticatableEntity, userType: AuthType): string
  generateRefreshToken(user: AuthenticatableEntity, userType: AuthType): string
  verifyAccessToken(token: string): void
  verifyRefreshToken(token: string): void
}
