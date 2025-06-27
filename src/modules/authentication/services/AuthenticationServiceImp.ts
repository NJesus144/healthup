import { AuthenticationService } from '@/interfaces/services/AuthenticationService'
import { InvalidCredentialsError, InvalidRefreshTokenError, NotFoundError } from '@/shared/errors/AppError'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { User, UserRole } from '@prisma/client'
import { UserRepository } from '@/interfaces/repositories/UserRepository'

export class AuthenticationServiceImp implements AuthenticationService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId)
  }

  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.userRepository.findByEmail(email)

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new InvalidCredentialsError()
    }

    const accessToken = this.generateAccessToken(user)
    const refreshToken = this.generateRefreshToken(user)

    return { access_token: accessToken, refresh_token: refreshToken }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.verifyRefreshToken(refreshToken)
      const user = await this.userRepository.findById(payload.sub)

      if (!user) {
        throw new NotFoundError('User not found')
      }

      const newAccessToken = this.generateAccessToken(user)
      const newRefreshToken = this.generateRefreshToken(user)

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      }
    } catch (error) {
      throw new InvalidRefreshTokenError()
    }
  }

  generateAccessToken(user: User): string {
    return jwt.sign(
      {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as any,
        subject: user.id?.toString(),
        algorithm: 'RS256',
      }
    )
  }

  generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as any,
        subject: user.id?.toString(),
        algorithm: 'RS256',
      }
    )
  }

  verifyAccessToken(token: string): {
    sub: string
    name: string
    email: string
    role: UserRole
    iat: number
    exp: number
  } {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ['RS256'],
    }) as {
      sub: string
      name: string
      email: string
      role: UserRole
      iat: number
      exp: number
    }
  }

  verifyRefreshToken(token: string): {
    sub: string
    name: string
    email: string
    role: UserRole
    iat: number
    exp: number
  } {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ['RS256'],
    }) as {
      sub: string
      name: string
      email: string
      role: UserRole
      iat: number
      exp: number
    }
  }
}
