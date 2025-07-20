import { AdminRepository } from '@/interfaces/repositories/AdminRepository'
import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { AdminService } from '@/interfaces/services/AdminService'
import { DashboardDTO } from '@/modules/admin/dtos/DashboardDTO'
import { UpdateDoctorStatusDTO } from '@/modules/admin/dtos/UpdateDoctorStatusDTO'
import notificationService from '@/modules/notifications/services/notificationService'
import { ConflictError, InternalServerError, NotFoundError } from '@/shared/errors/AppError'
import { UserStatus } from '@prisma/client'

export class AdminServiceImp implements AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly doctorRepository: DoctorRepository
  ) {}

  async getDashboardMetrics(): Promise<DashboardDTO> {
    return this.adminRepository.getDashboardMetrics()
  }

  async getPendingDoctors() {
    return this.adminRepository.getPendingDoctors()
  }

  async updateDoctorStatus(id: string, data: UpdateDoctorStatusDTO): Promise<void> {
    const doctor = await this.doctorRepository.getDoctorById(id)

    if (!doctor) throw new NotFoundError('Doctor not found')

    if (doctor.status !== UserStatus.PENDING) throw new ConflictError('Doctor status must be PENDING to update')

    const updatedDoctor = await this.adminRepository.updateDoctorStatus(id, data.status)

    if (!updatedDoctor) throw new InternalServerError('Internal server error while updating doctor status ')
    if (updatedDoctor.status === UserStatus.ACTIVE) {
      await notificationService.sendApprovedDoctorNotification(updatedDoctor.email, updatedDoctor.name)
    } else if (updatedDoctor.status === UserStatus.REJECTED) {
      await notificationService.sendRejectedDoctorNotification(updatedDoctor.email, updatedDoctor.name)
    }
  }
}
