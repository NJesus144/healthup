import { NextFunction, Request, Response } from 'express'
import { LogHelper } from '../utils/logHelpers'
import logger from '@/config/logger'
import { pinoHttp } from 'pino-http'

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    }
    return 'info'
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`
  },
})

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id

  LogHelper.logError(error, {
    userId,
    action: `${req.method} ${req.path}`,
    statusCode: res.statusCode,
  })

  next(error)
}

export const authLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send

  res.send = function (body) {
    if (req.path.includes('/auth/login') || req.path.includes('/auth/logout')) {
      const action = req.path.includes('/login') ? 'login' : 'logout'
      const userId = res.statusCode === 200 ? (req as any).user?.id : undefined

      LogHelper.logAuth(action, {
        userId,
        statusCode: res.statusCode,
      })
    }

    return originalSend.call(this, body)
  }

  next()
}
