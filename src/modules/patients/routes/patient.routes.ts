import { Request, Response, Router } from 'express'
import { PatientController } from '@/modules/patients/controllers/PatientController'
import { asyncHandler, errorHandler } from '@/shared/errors/errorHandler'
import { PatientServiceImp } from '@/modules/patients/services/PatientServiceImp'
// import { InMemoryPatientRepository } from '@/modules/patients/repositories/InMemoryPatientRepository'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { AuthenticatedRequest, createAuthMiddleware } from '@/shared/middlewares/authenticationMiddleware'
import { PatientRepositoryImp } from '@/modules/patients/repositories/PatientRepository'

const router = Router()

const patientRepository = new PatientRepositoryImp()
const patientService = new PatientServiceImp(patientRepository)
const authenticationService = new AuthenticationServiceImp(patientService)
const patientController = new PatientController(patientService)
const authenticationMiddleware = createAuthMiddleware(authenticationService)

router.post('/', asyncHandler(patientController.create.bind(patientController)))

// router.get('/profile/:id', authenticationMiddleware, (req: AuthenticatedRequest, res: Response) => patientController.profile(req, res))

router.get(
  '/me',
  authenticationMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => patientController.me(req, res))
)

router.put(
  '/:id',
  authenticationMiddleware,
  asyncHandler((req: AuthenticatedRequest, res: Response) => patientController.update(req, res))
)

router.use(errorHandler)

export default router
