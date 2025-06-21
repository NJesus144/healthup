export class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)

    this.statusCode = statusCode

    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(message, 500)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401)
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message: string = 'Invalid credentials') {
    super(message)
  }
}

export class TokenNotProvidedError extends UnauthorizedError {
  constructor(message: string = 'Token not provided') {
    super(message)
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor(message: string = 'Token expired') {
    super(message)
  }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor(message: string = 'Invalid refresh token') {
    super(message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}
