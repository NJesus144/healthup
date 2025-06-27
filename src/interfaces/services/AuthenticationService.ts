import { User, UserRole } from '@prisma/client'

export interface AuthenticationService {
  login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }>
  refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }>
  generateAccessToken(user: User): string
  generateRefreshToken(user: User): string
  verifyAccessToken(token: string): { sub: string; email: string; role: UserRole; iat: number; exp: number }
  verifyRefreshToken(token: string): { sub: string; email: string; role: UserRole; iat: number; exp: number }
  findUserById(userId: string): Promise<User | null>
}
