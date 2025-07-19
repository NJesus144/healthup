import { AppointmentService } from '@/interfaces/services/AppointmentService'
import { CreateAppointmentDTO } from '@/modules/appointments/dtos/CreateAppointmentDTO'
import { validateCreateAppointment } from '@/modules/appointments/validators/validateCreateAppointment'
import { responseSuccess } from '@/shared/helpers/responseSuccess'
import { AuthenticatedRequest } from '@/shared/middlewares/authenticationMiddleware'
import { LogHelper } from '@/shared/utils/logHelpers'
import { Request, Response } from 'express'

export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const patientId = req.user!.sub
    const appointmentData = validateCreateAppointment({ patientId, ...req.body })

    const appointment = await this.appointmentService.createAppointment(appointmentData as CreateAppointmentDTO)

    LogHelper.logAppointment('created', {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId,
      action: 'create_appointment',
    })

    return responseSuccess(res, appointment, 'Appointment created successfully', 201)
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params

    const appointment = await this.appointmentService.getAppointmentById(id)

    LogHelper.logSuccess('appointment_retrieved', {
      userId: appointment.patientId,
      appointmentId: id,
      statusCode: 200,
    })

    return responseSuccess(res, appointment, 'Appointment retrieved successfully')
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params
    const updateData = req.body

    const appointment = await this.appointmentService.updateAppointment(id, updateData)

    LogHelper.logSuccess('appointment_deleted', {
      userId: req.user!.sub,
      appointmentId: id,
      statusCode: 200,
    })

    return responseSuccess(res, appointment, 'Appointment updated successfully')
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { id } = req.params
    const userId = req.user!.sub
    const role = req.user!.role

    const appointment = await this.appointmentService.deleteAppointment(id, userId, role)

    LogHelper.logAppointment('cancelled', {
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientId: req.user!.sub,
      action: 'cancel_appointment',
    })

    return responseSuccess(res, null, 'Appointment deleted successfully')
  }

  async getMyAppointments(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const userId = req.user!.sub
    const userRole = req.user!.role

    const appointments = await this.appointmentService.getMyAppointments(userId, userRole)

    return responseSuccess(res, appointments, 'Appointments retrieved successfully')
  }
}
