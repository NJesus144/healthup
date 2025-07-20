import { AuthenticationService } from '@/interfaces/services/AuthenticationService'
import { validateLoginData } from '@/modules/authentication/validators/validateLoginData'
import { Request, Response } from 'express'
import { LoginDTO } from '@/modules/authentication/dtos/LoginDTO'
import { responseSuccess } from '@/shared/helpers/responseSuccess'
import { TokenExpiredError, TokenNotProvidedError } from '@/shared/errors/AppError'
import jwt from 'jsonwebtoken'
import { LogHelper } from '@/shared/utils/logHelpers'

export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = validateLoginData(req.body as LoginDTO)

    const userInfo = await this.authenticationService.login(email, password)

    this.generateAccessTokenCookie(res, userInfo.access_token)
    this.generateRefreshTokenCookie(res, userInfo.refresh_token)

    LogHelper.logAuth('login', {
      category: 'auth',
      action: 'login',
      userId: userInfo.userId,
    })

    return responseSuccess(res, userInfo, 'Login successful')
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.body?.refresh_token || req.headers.authorization?.replace('Bearer ', '') || req.cookies?.refreshToken

    if (!refreshToken) {
      throw new TokenNotProvidedError('Refresh token not provided')
    }

    try {
      const userInfo = await this.authenticationService.refreshToken(refreshToken)

      this.generateAccessTokenCookie(res, userInfo.access_token)
      this.generateRefreshTokenCookie(res, userInfo.refresh_token)

      LogHelper.logAuth('login', {
        category: 'auth',
        action: 'login',
        userId: userInfo.userId,
      })

      return responseSuccess(res, userInfo, 'Token refreshed successfully')
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError('Token expired')
      }
      throw error
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    LogHelper.logAuth('login', {
      category: 'auth',
      action: 'logout',
    })

    return res.status(204).end()
  }

  private generateAccessTokenCookie(res: Response, accessToken: string): void {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    })
  }

  private generateRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/refresh-token',
    })
  }
}
