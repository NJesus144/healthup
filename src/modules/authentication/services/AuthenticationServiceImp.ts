import { AuthenticationService } from '@/interfaces/services/AuthenticationService'
import { InvalidCredentialsError, InvalidRefreshTokenError, NotFoundError } from '@/shared/errors/AppError'
import { AuthenticationStrategy } from '@/interfaces/auth/AuthenticationStrategy'
import { AuthenticatableEntity, AuthType } from '@/interfaces/auth/AuthenticableEntity'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export class AuthenticationServiceImp implements AuthenticationService {
  constructor(private readonly authStrategy: AuthenticationStrategy) {}

  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.authStrategy.findByEmail(email)

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new InvalidCredentialsError()
    }

    const accessToken = this.generateAccessToken(user, this.authStrategy.getUserType())
    const refreshToken = this.generateRefreshToken(user, this.authStrategy.getUserType())

    return { access_token: accessToken, refresh_token: refreshToken }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.verifyRefreshToken(refreshToken)
      const user = await this.authStrategy.findById(payload.sub)

      if (!user) {
        throw new NotFoundError('User not found')
      }

      const newAccessToken = this.generateAccessToken(user, this.authStrategy.getUserType())
      const newRefreshToken = this.generateRefreshToken(user, this.authStrategy.getUserType())

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      }
    } catch (error) {
      throw new InvalidRefreshTokenError()
    }
  }

  generateAccessToken(user: AuthenticatableEntity, userType: AuthType): string {
    return jwt.sign(
      {
        name: user.name,
        email: user.email,
        userType,
      },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as any,
        subject: user.id?.toString(),
        algorithm: 'RS256',
      }
    )
  }

  generateRefreshToken(user: AuthenticatableEntity, userType: AuthType): string {
    return jwt.sign(
      {
        name: user.name,
        email: user.email,
        userType,
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
    iat: number
    exp: number
  } {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ['RS256'],
    }) as {
      sub: string
      name: string
      email: string
      iat: number
      exp: number
    }
  }

  verifyRefreshToken(token: string): {
    sub: string
    name: string
    email: string
    iat: number
    exp: number
  } {
    return jwt.verify(token, process.env.JWT_PUBLIC_KEY as string, {
      algorithms: ['RS256'],
    }) as {
      sub: string
      name: string
      email: string
      iat: number
      exp: number
    }
  }
}
