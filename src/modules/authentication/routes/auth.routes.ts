import { Router, Request, Response } from 'express'
import { AuthenticationController } from '@/modules/authentication/controllers/AuthenticationController'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { asyncHandler, errorHandler } from '@/shared/errors/errorHandler'
import { PrismaClient } from '@prisma/client'
import { UserRepositoryImp } from '@/interfaces/repositories/UserRepository'

const router = Router()

const prisma = new PrismaClient()
const userRepository = new UserRepositoryImp(prisma)
const authService = new AuthenticationServiceImp(userRepository)
const authController = new AuthenticationController(authService)

router.post(
  '/login',
  asyncHandler((req: Request, res: Response) => authController.login(req, res))
)

router.post(
  '/refresh-token',
  asyncHandler((req: Request, res: Response) => authController.refreshToken(req, res))
)

router.post(
  '/logout',
  asyncHandler((req: Request, res: Response) => authController.logout(req, res))
)

router.use(errorHandler)

export default router
