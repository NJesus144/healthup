import { Router, Request, Response } from 'express'

import { errorHandler } from '@/shared/errors/errorHandler'

import { PatientServiceImp } from '@/modules/patients/services/PatientServiceImp'
import { AuthenticationServiceImp } from '@/modules/authentication/services/AuthenticationServiceImp'
import { AuthenticationController } from '@/modules/authentication/controllers/AuthenticationController'
import { PatientRepositoryImp } from '@/modules/patients/repositories/PatientRepository'
// import { InMemoryPatientRepository } from '@/modules/patients/repositories/InMemoryPatientRepository'

const router = Router()

const patientRepository = new PatientRepositoryImp()
const patientService = new PatientServiceImp(patientRepository)
const authService = new AuthenticationServiceImp(patientService)
const authController = new AuthenticationController(authService)

router.post('/login', (req: Request, res: Response) => authController.login(req, res))

router.post('/refresh-token', (req: Request, res: Response) => authController.refreshToken(req, res))

router.post('/logout', (req: Request, res: Response) => authController.logout(req, res))

router.use(errorHandler)

export default router
