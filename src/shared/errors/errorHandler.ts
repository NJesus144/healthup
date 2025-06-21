import { Request, Response, NextFunction } from 'express'
import { AppError } from './AppError'

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  console.error('Unexpected error', err)

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}
