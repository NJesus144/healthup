import { DoctorController } from '@/modules/doctors/controllers/DoctorController'
import { DoctorServiceImp } from '@/modules/doctors/services/DoctorServiceImp'
import { asyncHandler, errorHandler } from '@/shared/errors/errorHandler'
import { Response, Router } from 'express'
import { DoctorRepositoryImp } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { AuthenticatedRequest, createAuthMiddleware } from '@/shared/middlewares/authenticationMiddleware'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { DoctorAuthenticationStrategy } from '@/interfaces/auth/DoctorAuthenticationStrategy'

const router = Router()

const doctorRepository = new DoctorRepositoryImp()
const doctorService = new DoctorServiceImp(doctorRepository)

const doctorAuthStrategy = new DoctorAuthenticationStrategy(doctorService)

const authenticationService = new AuthenticationServiceImp(doctorAuthStrategy)

const doctorController = new DoctorController(doctorService)
const authenticationMiddleware = createAuthMiddleware(authenticationService)

router.post('/', asyncHandler(doctorController.create.bind(doctorController)))
router.get('/', asyncHandler(doctorController.getAllDoctors.bind(doctorController)))

router.get(
  '/me',
  authenticationMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => doctorController.me(req, res))
)

router.put(
  '/',
  authenticationMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => doctorController.update(req, res))
)

router.use(errorHandler)

export default router
