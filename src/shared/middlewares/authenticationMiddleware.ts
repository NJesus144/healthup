import { Request, Response, NextFunction } from 'express'
import { TokenNotProvidedError, TokenExpiredError } from '@/shared/errors/AppError'
import { AuthenticationService } from '@/interfaces/services/AuthenticationService'

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string
    name: string
    email: string
    iat: number
    exp: number
  }
}

export function createAuthMiddleware(authenticationService: AuthenticationService) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken

      if (!token) {
        throw new TokenNotProvidedError('Access token not provided')
      }

      const payload = (await authenticationService.verifyAccessToken(token)) as AuthenticatedRequest['user']
      req.user = payload

      next()
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'TokenExpiredError') {
        next(new TokenExpiredError('Access token expired'))
      } else {
        next(error)
      }
    }
  }
}
