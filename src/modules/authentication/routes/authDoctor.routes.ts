import { DoctorAuthenticationStrategy } from '@/interfaces/auth/DoctorAuthenticationStrategy'
import { AuthenticationController } from '@/modules/authentication/controllers/AuthenticationController'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { DoctorRepositoryImp } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { DoctorServiceImp } from '@/modules/doctors/services/DoctorServiceImp'
import { Request, Response, Router } from 'express'

const router = Router()

const doctorRepository = new DoctorRepositoryImp()
const doctorService = new DoctorServiceImp(doctorRepository)
const doctorAuthStrategy = new DoctorAuthenticationStrategy(doctorService)
const doctorAuthService = new AuthenticationServiceImp(doctorAuthStrategy)
const doctorAuthController = new AuthenticationController(doctorAuthService)

router.post('/login', (req: Request, res: Response) => doctorAuthController.login(req, res))
router.post('/refresh-token', (req: Request, res: Response) => doctorAuthController.refreshToken(req, res))
router.post('/logout', (req: Request, res: Response) => doctorAuthController.logout(req, res))

export default router
