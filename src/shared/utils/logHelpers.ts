import logger from '@/config/logger'

export interface LogContext {
  userId?: string
  doctorId?: string
  patientId?: string
  appointmentId?: string
  action?: string
  duration?: number
  statusCode?: number
  error?: string
  email?: string
  [key: string]: any
}

export class LogHelper {
  static logAuth(action: 'login' | 'logout' | 'token_expired' | 'unauthorized', context: LogContext) {
    logger.info(
      {
        category: 'auth',
        action,
        userId: context.userId,
        statusCode: context.statusCode,
        duration: context.duration,
      },
      `Authentication ${action}`
    )
  }

  static logAppointment(action: 'created' | 'cancelled' | 'confirmed' | 'rescheduled', context: LogContext) {
    logger.info(
      {
        category: 'appointment',
        action,
        appointmentId: context.appointmentId,
        doctorId: context.doctorId,
        patientId: context.patientId,
        userId: context.userId,
      },
      `Appointment ${action}`
    )
  }

  static logNotification(action: string, context: LogContext) {
    logger.info(
      {
        category: 'notification',
        action: context.action,
        email: context.email,
        appointmentId: context.appointmentId,
        userId: context.userId,
        doctorId: context.doctorId,
        error: context.error,
      },
      `Notification ${action}`
    )
  }

  static logError(error: Error, context: LogContext = {}) {
    const errorContext = {
      category: 'error',
      error: error.message,
      stack: error.stack,
      userId: context.userId,
      action: context.action,
      statusCode: context.statusCode,
      method: context.method,
      path: context.path,
      duration: context.duration,
      userAgent: context.userAgent,
      ip: context.ip,
      timestamp: new Date().toISOString(),
    }

    if (context.statusCode && context.statusCode >= 500) {
      logger.error(errorContext, 'Server error occurred')
    } else if (context.statusCode && context.statusCode >= 400) {
      logger.warn(errorContext, 'Client error occurred')
    } else {
      logger.error(errorContext, 'Unexpected error occurred')
    }
  }

  static logSuccess(action: string, context: LogContext) {
    logger.info(
      {
        category: 'success',
        action,
        userId: context.userId,
        doctorId: context.doctorId,
        patientId: context.patientId,
        appointmentId: context.appointmentId,
        statusCode: context.statusCode,
        data: context.data,
      },
      `Success: ${action}`
    )
  }
}
