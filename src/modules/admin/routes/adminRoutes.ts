// src/modules/admin/routes/adminRoutes.ts
import { Router, Response } from 'express'
import { AdminController } from '@/modules/admin/controllers/AdminController'
import { AdminServiceImp } from '@/modules/admin/services/AdminServiceImp'
import { asyncHandler, errorHandler } from '@/shared/errors/errorHandler'
import { AuthenticatedRequest, createAuthMiddleware } from '@/shared/middlewares/authenticationMiddleware'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { UserRepositoryImp } from '@/interfaces/repositories/UserRepository'
import { prisma } from '@/config/prisma'
import { AdminRepositoryImp } from '@/modules/admin/repositories/AdminRepositoryImp'
import { DoctorRepositoryImp } from '@/modules/doctors/repositories/DoctorRepositoryImp'

const router = Router()

const userRepository = new UserRepositoryImp(prisma)
const adminRepository = new AdminRepositoryImp()
const doctorRepository = new DoctorRepositoryImp()

const authenticationService = new AuthenticationServiceImp(userRepository)
const adminService = new AdminServiceImp(adminRepository, doctorRepository)

const adminController = new AdminController(adminService)

const authMiddleware = createAuthMiddleware(authenticationService)

router.use(authMiddleware)

router.get(
  '/dashboard',
  asyncHandler((req: AuthenticatedRequest, res: Response) => adminController.getDashboardMetrics(req, res))
)

router.get(
  '/doctors/pending',
  asyncHandler((req: AuthenticatedRequest, res: Response) => adminController.getPendingDoctors(req, res))
)

router.patch(
  '/doctors/:id/status',
  asyncHandler((req: AuthenticatedRequest, res: Response) => {
    adminController.updateDoctorStatus(req, res)
  })
)

router.use(errorHandler)

export default router
