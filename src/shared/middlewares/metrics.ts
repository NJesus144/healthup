import { httpRequestsTotal } from '@/metrics'
import { Request, Response, NextFunction } from 'express'

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
    })
  })
  next()
}
