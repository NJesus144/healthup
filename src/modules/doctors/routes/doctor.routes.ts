import { DoctorController } from '@/modules/doctors/controllers/DoctorController'
import { DoctorServiceImp } from '@/modules/doctors/services/DoctorServiceImp'
import { asyncHandler, errorHandler } from '@/shared/errors/errorHandler'
import { Response, Router } from 'express'
import { DoctorRepositoryImp } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { AuthenticatedRequest, createDoctorOnlyMiddleware } from '@/shared/middlewares/authenticationMiddleware'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { prisma } from '@/config/prisma'
import { UserRepositoryImp } from '@/interfaces/repositories/UserRepository'
import { AppointmentRepositoryImp } from '@/modules/appointments/repositories/AppointmentRepositoryImp'

const router = Router()

const userRepository = new UserRepositoryImp(prisma)
const doctorRepository = new DoctorRepositoryImp()
const appointmentRepository = new AppointmentRepositoryImp()

const authenticationService = new AuthenticationServiceImp(userRepository)
const doctorService = new DoctorServiceImp(doctorRepository, appointmentRepository)

const doctorController = new DoctorController(doctorService)

const doctorOnlyMiddleware = createDoctorOnlyMiddleware(authenticationService)

router.post('/', asyncHandler(doctorController.create.bind(doctorController)))
router.get('/', asyncHandler(doctorController.getAllDoctors.bind(doctorController)))

router.get(
  '/me',
  doctorOnlyMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => doctorController.me(req, res))
)

router.put(
  '/',
  doctorOnlyMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => doctorController.update(req, res))
)

router.post(
  '/blocked-date',
  doctorOnlyMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => doctorController.blockedDate(req, res))
)

router.delete(
  '/blocked-date',
  doctorOnlyMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => doctorController.cancelBlockedDate(req, res))
)

router.get(
  '/blocked-date',
  doctorOnlyMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => doctorController.getBlockedDates(req, res))
)

router.get('/:doctorId/availability', asyncHandler(doctorController.getAvailability.bind(doctorController)))

router.use(errorHandler)

export default router
