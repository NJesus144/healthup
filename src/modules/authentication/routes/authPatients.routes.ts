import { PatientAuthenticationStrategy } from '@/interfaces/auth/PatientAuthenticationStrategy'
import { AuthenticationController } from '@/modules/authentication/controllers/AuthenticationController'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { PatientRepositoryImp } from '@/modules/patients/repositories/PatientRepository'
import { PatientServiceImp } from '@/modules/patients/services/PatientServiceImp'
import { Request, Response, Router } from 'express'

const router = Router()

const patientRepository = new PatientRepositoryImp()
const patientService = new PatientServiceImp(patientRepository)
const patientAuthStrategy = new PatientAuthenticationStrategy(patientService)
const patientAuthService = new AuthenticationServiceImp(patientAuthStrategy)
const patientAuthController = new AuthenticationController(patientAuthService)

router.post('/login', (req: Request, res: Response) => patientAuthController.login(req, res))
router.post('/refresh-token', (req: Request, res: Response) => patientAuthController.refreshToken(req, res))
router.post('/logout', (req: Request, res: Response) => patientAuthController.logout(req, res))

export default router
