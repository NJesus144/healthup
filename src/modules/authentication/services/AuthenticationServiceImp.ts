import bcrypt from 'bcrypt'
import { AuthenticationService } from '@/interfaces/services/AuthenticationService'
import { PatientService } from '@/interfaces/services/PatientService'
import jwt from 'jsonwebtoken'
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  NotFoundError,
} from '@/shared/errors/AppError'
import { Patient } from '@/modules/patients/models/Patient'

export class AuthenticationServiceImp implements AuthenticationService {
  constructor(private readonly patientService: PatientService) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const patient = await this.patientService.getPatientByEmail(email)

    if (!patient || !bcrypt.compareSync(password, patient.passwordHash)) {
      throw new InvalidCredentialsError()
    }

    const accessToken = this.generateAccessToken(patient)
    const refreshToken = this.generateRefreshToken(patient)

    return { access_token: accessToken, refresh_token: refreshToken }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.verifyRefreshToken(refreshToken)
      const patient = await this.patientService.getPatientById(payload.sub)

      if (!patient) {
        throw new NotFoundError('Patient not found')
      }

      const newAccessToken = this.generateAccessToken(patient)
      const newRefreshToken = this.generateRefreshToken(patient)

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      }
    } catch (error) {
      throw new InvalidRefreshTokenError()
    }
  }

  generateAccessToken(patient: Patient): string {
    return jwt.sign(
      {
        name: patient.name,
        email: patient.email,
      },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as any,
        subject: patient.id?.toString(),
        algorithm: 'RS256',
      },
    )
  }

  generateRefreshToken(patient: Patient): string {
    return jwt.sign(
      {
        name: patient.name,
        email: patient.email,
      },
      process.env.JWT_PRIVATE_KEY as string,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as any,
        subject: patient.id?.toString(),
        algorithm: 'RS256',
      },
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
