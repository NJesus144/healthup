import { Request, Response } from 'express'
import { PatientService } from '@/interfaces/services/PatientService'
import { validateCreatePatient } from '@/modules/patients/validators/validateCreatePatient'
import { responseSuccess } from '@/shared/helpers/responseSuccess'
import { validateUpdatePatient } from '@/modules/patients/validators/validateUpdatePatient'
import { AuthenticatedRequest } from '@/shared/middlewares/authenticationMiddleware'
import { LogHelper } from '@/shared/utils/logHelpers'

export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const data = validateCreatePatient(req.body)

    const patient = await this.patientService.createPatient(data)

    LogHelper.logSuccess('patient_created', {
      data: patient,
      statusCode: 201,
    })

    return responseSuccess(res, patient, 'Patient created successfully', 201)
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const patientId = req.user!.sub

    const patient = await this.patientService.getPatientById(patientId)

    return responseSuccess(res, patient, 'Patient profile retrieved successfully')
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const patientId = req.user!.sub
    const data = validateUpdatePatient(req.body)

    const patient = await this.patientService.updatePatient(patientId, data)

    LogHelper.logSuccess('patient_updated', {
      data: patient,
      statusCode: 200,
    })

    return responseSuccess(res, patient, 'Patient updated successfully')
  }
}
