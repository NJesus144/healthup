import { PatientService } from '@/interfaces/services/PatientService'
import { AuthenticationServiceImp } from './AuthenticationServiceImp'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

jest.mock('bcrypt')
jest.mock('jsonwebtoken')

const mockPatientService = {
  getPatientByEmail: jest.fn(),
  getPatientById: jest.fn(),
  createPatient: jest.fn(),
  updatePatient: jest.fn(),
} as jest.Mocked<PatientService>

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('AuthenticationService', () => {
  let authService: AuthenticationServiceImp

  const mockPatient = {
    id: '1',
    name: 'João Silva',
    email: 'joao@gmail.com',
    phone: '11999999999',
    cpf: '52998224725',
  }

  const mockPrismaPatient = {
    ...mockPatient,
    passwordHash: '$2b$10$hashedpassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTokenPayload = {
    sub: '1',
    name: 'João Silva',
    email: 'joao@gmail.com',
    iat: 1234567890,
    exp: 1234567890 + 3600,
  }

  beforeEach(() => {
    authService = new AuthenticationServiceImp(mockPatientService)
    jest.clearAllMocks()

    process.env.JWT_PRIVATE_KEY = 'private-key'
    process.env.JWT_PUBLIC_KEY = 'public-key'
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m'
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('login', () => {
    it('should return tokens when credentiasl are valid', async () => {
      const email = 'jaoo@gmail.com'
      const password = 'senha123'

      mockPatientService.getPatientByEmail.mockResolvedValue(mockPrismaPatient)
      mockBcrypt.compareSync.mockReturnValue(true)

      const mockSign = mockJwt.sign as unknown as jest.Mock<string, any[]>
      mockSign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token')

      const result = await authService.login(email, password)

      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      })
      expect(mockPatientService.getPatientByEmail).toHaveBeenCalledWith(email)
      expect(mockBcrypt.compareSync).toHaveBeenCalledWith(
        password,
        mockPrismaPatient.passwordHash,
      )
      expect(mockJwt.sign).toHaveBeenCalledTimes(2)
    })
  })

  it('should throw invalidCredentialsError when patient is not found', async () => {
    const email = 'nonexistent@gmail.com'
    const password = 'senha123'

    mockPatientService.getPatientByEmail.mockResolvedValue(null)

    await expect(authService.login(email, password)).rejects.toThrow(
      'Invalid credentials',
    )
    expect(mockPatientService.getPatientByEmail).toHaveBeenCalledWith(email)
    expect(mockBcrypt.compareSync).not.toHaveBeenCalled()
  })

  it('should throw InvalidCredentialsError when password is incorrect', async () => {
    const email = 'joao@gmail.com'
    const password = 'wrongpassword'

    mockPatientService.getPatientByEmail.mockResolvedValue(mockPrismaPatient)
    mockBcrypt.compareSync.mockReturnValue(false)

    await expect(authService.login(email, password)).rejects.toThrow(
      'Invalid credentials',
    )
    expect(mockPatientService.getPatientByEmail).toHaveBeenCalledWith(email)
    expect(mockBcrypt.compareSync).toHaveBeenCalledWith(
      password,
      mockPrismaPatient.passwordHash,
    )
  })

  it('should throw InvalidCredentialsError when patient exists but has no passwordHash', async () => {
    const email = 'joao@gmail.com'
    const password = 'senha123'
    const patientWithoutPassword = { ...mockPrismaPatient, passwordHash: null }

    mockPatientService.getPatientByEmail.mockResolvedValue(
      patientWithoutPassword as any,
    )

    await expect(authService.login(email, password)).rejects.toThrow(
      'Invalid credentials',
    )
  })

  describe('refreshToken', () => {
    const mockSign = mockJwt.sign as unknown as jest.Mock<string, any[]>
    const mockVerify = mockJwt.verify as unknown as jest.Mock
    it('should return new tokens when refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token'

      mockVerify.mockReturnValue(mockTokenPayload)
      mockPatientService.getPatientById.mockResolvedValue(mockPatient)

      mockSign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token')

      const result = await authService.refreshToken(refreshToken)

      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      })
      expect(mockJwt.verify).toHaveBeenCalledWith(
        refreshToken,
        process.env.JWT_PUBLIC_KEY,
        { algorithms: ['RS256'] },
      )
      expect(mockPatientService.getPatientById).toHaveBeenCalledWith(
        mockTokenPayload.sub,
      )
      expect(mockJwt.sign).toHaveBeenCalledTimes(2)
    })

    it('should throw InvalidRefreshTokenError when token is invalid', async () => {
      const invalidToken = 'invalid-token'

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(authService.refreshToken(invalidToken)).rejects.toThrow(
        'Invalid refresh token',
      )
      expect(mockJwt.verify).toHaveBeenCalledWith(
        invalidToken,
        process.env.JWT_PUBLIC_KEY,
        { algorithms: ['RS256'] },
      )
    })

    it('should throw InvalidRefreshTokenError when patient is not found', async () => {
      const refreshToken = 'valid-refresh-token'

      mockVerify.mockReturnValue(mockTokenPayload)
      mockPatientService.getPatientById.mockResolvedValue(null)

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token',
      )
      expect(mockJwt.verify).toHaveBeenCalledWith(
        refreshToken,
        process.env.JWT_PUBLIC_KEY,
        { algorithms: ['RS256'] },
      )
      expect(mockPatientService.getPatientById).toHaveBeenCalledWith(
        mockTokenPayload.sub,
      )
    })

    it('should throw InvalidRefreshTokenError when jwt.verify throws any error', async () => {
      const refreshToken = 'expired-token'

      mockJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date())
      })

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token',
      )
    })
  })

  describe('generateAccessToken', () => {
    const mockSign = mockJwt.sign as unknown as jest.Mock<string, any[]>
    it('should generate access token with correct payload and options', () => {
      const expectedToken = 'generated-access-token'
      mockSign.mockReturnValue(expectedToken)

      const result = authService.generateAccessToken(mockPatient)

      expect(result).toBe(expectedToken)
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          name: mockPatient.name,
          email: mockPatient.email,
        },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
          subject: mockPatient.id?.toString(),
          algorithm: 'RS256',
        },
      )
    })
  })

  describe('generateRefreshToken', () => {
    const mockSign = mockJwt.sign as unknown as jest.Mock<string, any[]>

    it('should generate refresh token with correct payload and options', () => {
      const expectedToken = 'generated-refresh-token'
      mockSign.mockReturnValue(expectedToken)

      const result = authService.generateRefreshToken(mockPatient)

      expect(result).toBe(expectedToken)
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          name: mockPatient.name,
          email: mockPatient.email,
        },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
          subject: mockPatient.id?.toString(),
          algorithm: 'RS256',
        },
      )
    })
  })

  describe('verifyAccessToken', () => {
    const mockVerify = mockJwt.verify as unknown as jest.Mock

    it('should verify and return decoded token payload', () => {
      const token = 'valid-access-token'
      mockVerify.mockReturnValue(mockTokenPayload)

      const result = authService.verifyAccessToken(token)

      expect(result).toEqual(mockTokenPayload)
      expect(mockJwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_PUBLIC_KEY,
        { algorithms: ['RS256'] },
      )
    })

    it('should throw error when token is invalid', () => {
      const invalidToken = 'invalid-token'
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      expect(() => authService.verifyAccessToken(invalidToken)).toThrow(
        'Invalid token',
      )
      expect(mockJwt.verify).toHaveBeenCalledWith(
        invalidToken,
        process.env.JWT_PUBLIC_KEY,
        { algorithms: ['RS256'] },
      )
    })
  })

  describe('verifyRefreshToken', () => {
    const mockVerify = mockJwt.verify as unknown as jest.Mock

    it('should verify and return decoded token payload', () => {
      const token = 'valid-refresh-token'
      mockVerify.mockReturnValue(mockTokenPayload)

      const result = authService.verifyRefreshToken(token)

      expect(result).toEqual(mockTokenPayload)
      expect(mockJwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_PUBLIC_KEY,
        { algorithms: ['RS256'] },
      )
    })

    it('should throw error when token is invalid', () => {
      const invalidToken = 'invalid-token'
      const error = new Error('Invalid token')
      mockJwt.verify.mockImplementation(() => {
        throw error
      })

      expect(() => authService.verifyRefreshToken(invalidToken)).toThrow(
        'Invalid token',
      )
      expect(mockJwt.verify).toHaveBeenCalledWith(
        invalidToken,
        process.env.JWT_PUBLIC_KEY,
        { algorithms: ['RS256'] },
      )
    })
  })
})
