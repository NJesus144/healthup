import { Request, Response } from 'express'
import { validateCreateDoctor } from '@/modules/doctors/vlidators/validateCreateDoctor'
import { DoctorService } from '@/interfaces/services/DoctorService'
import { responseSuccess } from '@/shared/helpers/responseSuccess'

export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  async create(req: Request, res: Response): Promise<Response> {
    const data = validateCreateDoctor(req.body)

    const patient = await this.doctorService.createDoctor(data)

    return responseSuccess(res, patient, 'Doctor created successfully', 201)
  }
}
