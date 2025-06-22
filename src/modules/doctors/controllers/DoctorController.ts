import { Request, Response } from 'express'
import { DoctorService } from '@/interfaces/services/DoctorService'
import { responseSuccess } from '@/shared/helpers/responseSuccess'
import { AuthenticatedRequest } from '@/shared/middlewares/authenticationMiddleware'
import { validateCreateDoctor } from '@/modules/doctors/validators/validateCreateDoctor'
import { validateUpdateDoctor } from '@/modules/doctors/validators/validateUpdateDoctor'
import { validateGetDoctorsQuery } from '@/modules/doctors/validators/validateQueryParameters'

export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const data = validateCreateDoctor(req.body)

    const doctor = await this.doctorService.createDoctor(data)

    return responseSuccess(res, doctor, 'Doctor created successfully', 201)
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const doctorId = req.user!.sub

    const doctor = await this.doctorService.getDoctorById(doctorId)

    return responseSuccess(res, doctor, 'Doctor profile retrieved successfully')
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const doctorId = req.user!.sub
    const data = validateUpdateDoctor(req.body)

    const doctor = await this.doctorService.updateDoctor(doctorId, data)

    return responseSuccess(res, doctor, 'Doctor updated successfully')
  }

  async getAllDoctors(req: Request, res: Response): Promise<Response> {
    const queryDto = validateGetDoctorsQuery(req.query)
    const doctors = await this.doctorService.findAllAvailableDoctors(queryDto)

    return responseSuccess(res, doctors, 'Doctors retrieved successfully')
  }
}
