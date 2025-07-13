import { AdminService } from '@/interfaces/services/AdminService'
import { UpdateDoctorStatusDTO } from '@/modules/admin/dtos/UpdateDoctorStatusDTO'
import { validateIfUserIsAdmin, validateUpdateDoctorStatus } from '@/modules/admin/validators/adminValidations'
import { responseSuccess } from '@/shared/helpers/responseSuccess'
import { AuthenticatedRequest } from '@/shared/middlewares/authenticationMiddleware'
import { Response } from 'express'

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  async getDashboardMetrics(req: AuthenticatedRequest, res: Response): Promise<Response> {
    validateIfUserIsAdmin(req.user!.role)

    const dashboardData = await this.adminService.getDashboardMetrics()

    return responseSuccess(res, dashboardData, 'Dashboard metrics retrieved successfully')
  }

  async getPendingDoctors(req: AuthenticatedRequest, res: Response): Promise<Response> {
    validateIfUserIsAdmin(req.user!.role)

    const pendingDoctors = await this.adminService.getPendingDoctors()

    return responseSuccess(res, pendingDoctors, 'Pending doctors retrieved successfully')
  }

  async updateDoctorStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
    validateIfUserIsAdmin(req.user!.role)

    const { id } = req.params
    const data: UpdateDoctorStatusDTO = validateUpdateDoctorStatus(req.body)

    await this.adminService.updateDoctorStatus(id, { status: data.status })

    return responseSuccess(res, null, `Doctor status updated to ${data.status} successfully`)
  }
}
