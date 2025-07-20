import { Request, Response, NextFunction } from 'express'
import { TokenNotProvidedError, TokenExpiredError, ForbiddenError, UnauthorizedError, NotFoundError } from '@/shared/errors/AppError'
import { AuthenticationService } from '@/interfaces/services/AuthenticationService'
import { UserRole } from '@prisma/client'

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string
    name: string
    email: string
    role: UserRole
    iat: number
    exp: number
  }
}

export function createAuthMiddleware(authenticationService: AuthenticationService, allowedRoles?: UserRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken

      if (!token) {
        throw new TokenNotProvidedError('Access token not provided')
      }

      const payload = (await authenticationService.verifyAccessToken(token)) as AuthenticatedRequest['user']

      if (!payload) {
        throw new TokenNotProvidedError('Invalid access token payload')
      }

      const user = await authenticationService.findUserById(payload.sub)

      if (!user) {
        throw new NotFoundError('User not found')
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        throw new ForbiddenError('Insufficient permissions')
      }

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

export function createDoctorOnlyMiddleware(authService: AuthenticationService) {
  return createAuthMiddleware(authService, [UserRole.DOCTOR])
}

export function createPatientOnlyMiddleware(authService: AuthenticationService) {
  return createAuthMiddleware(authService, [UserRole.PATIENT])
}
