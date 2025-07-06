import { Request, Response } from 'express'
import { DoctorService } from '@/interfaces/services/DoctorService'
import { responseSuccess } from '@/shared/helpers/responseSuccess'
import { AuthenticatedRequest } from '@/shared/middlewares/authenticationMiddleware'
import { validateCreateDoctor } from '@/modules/doctors/validators/validateCreateDoctor'
import { validateUpdateDoctor } from '@/modules/doctors/validators/validateUpdateDoctor'
import { validateGetDoctorsQuery } from '@/modules/doctors/validators/validateQueryParameters'
import { validateGetDoctorAvailability } from '@/modules/doctors/validators/validateGetDoctorAvailability'

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

  async blockedDate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const doctorId = req.user!.sub

    const blockedDate = await this.doctorService.blockedDate(doctorId, req.body)

    return responseSuccess(res, blockedDate, 'Blocked date retrieved successfully')
  }

  async cancelBlockedDate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const doctorId = req.user!.sub
    const { date } = req.body

    const canceledDate = await this.doctorService.cancelBlockedDate(doctorId, date)

    return responseSuccess(res, canceledDate, 'Blocked date canceled successfully')
  }

  async getBlockedDates(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const doctorId = req.user!.sub

    const blockedDates = await this.doctorService.getBlockedDates(doctorId)

    return responseSuccess(res, blockedDates, 'Blocked dates retrieved successfully')
  }

  async getAvailability(req: Request, res: Response): Promise<Response> {
    const { doctorId } = validateGetDoctorAvailability({ doctorId: req.params.doctorId })

    const availability = await this.doctorService.getDoctorAvailability(doctorId)

    return responseSuccess(res, availability, 'Doctor availability retrieved successfully')
  }
}
