import { PatientController } from '@/modules/patients/controllers/PatientController'
import { PatientServiceImp } from '@/modules/patients/services/PatientServiceImp'
import { asyncHandler, errorHandler } from '@/shared/errors/errorHandler'
import { Response, Router } from 'express'
import { PatientRepositoryImp } from '@/modules/patients/repositories/PatientRepository'
import { AuthenticatedRequest, createPatientOnlyMiddleware } from '@/shared/middlewares/authenticationMiddleware'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { prisma } from '@/config/prisma'
import { UserRepositoryImp } from '@/interfaces/repositories/UserRepository'

const router = Router()

const userRepository = new UserRepositoryImp(prisma)
const patientRepository = new PatientRepositoryImp()

const authenticationService = new AuthenticationServiceImp(userRepository)
const patientService = new PatientServiceImp(patientRepository)

const patientController = new PatientController(patientService)

const patientOnlyMiddleware = createPatientOnlyMiddleware(authenticationService)

router.post('/', asyncHandler(patientController.create.bind(patientController)))

router.get(
  '/me',
  patientOnlyMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => patientController.me(req, res))
)

router.put(
  '/',
  patientOnlyMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => patientController.update(req, res))
)

router.use(errorHandler)

export default router
