import { Router, Response } from 'express'
import { AppointmentController } from '@/modules/appointments/controllers/AppointmentController'
import { AppointmentServiceImp } from '@/modules/appointments/services/AppointmentServiceImp'
import { AppointmentRepositoryImp } from '@/modules/appointments/repositories/AppointmentRepositoryImp'
import { asyncHandler, errorHandler } from '@/shared/errors/errorHandler'
import { AuthenticatedRequest, createAuthMiddleware } from '@/shared/middlewares/authenticationMiddleware'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { UserRepositoryImp } from '@/interfaces/repositories/UserRepository'
import { prisma } from '@/config/prisma'
import { DoctorRepositoryImp } from '@/modules/doctors/repositories/DoctorRepositoryImp'

const router = Router()

const userRepository = new UserRepositoryImp(prisma)
const appointmentRepository = new AppointmentRepositoryImp()
const doctorRepository = new DoctorRepositoryImp()

const authenticationService = new AuthenticationServiceImp(userRepository)
const appointmentService = new AppointmentServiceImp(appointmentRepository, doctorRepository)

const appointmentController = new AppointmentController(appointmentService)

const authMiddleware = createAuthMiddleware(authenticationService)

router.post(
  '/',
  authMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => appointmentController.create(req, res))
)

router.get(
  '/my-appointments',
  authMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => appointmentController.getMyAppointments(req, res))
)

router.get('/:id', asyncHandler(appointmentController.getById.bind(appointmentController)))

router.put(
  '/:id',
  authMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => appointmentController.update(req, res))
)

router.delete(
  '/:id',
  authMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => appointmentController.delete(req, res))
)

router.use(errorHandler)
export default router
