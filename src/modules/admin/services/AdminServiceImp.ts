import { AdminRepository } from '@/interfaces/repositories/AdminRepository'
import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { AdminService } from '@/interfaces/services/AdminService'
import { DashboardDTO } from '@/modules/admin/dtos/DashboardDTO'
import { UpdateDoctorStatusDTO } from '@/modules/admin/dtos/UpdateDoctorStatusDTO'
import { ConflictError, NotFoundError } from '@/shared/errors/AppError'
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

    await this.adminRepository.updateDoctorStatus(id, data.status)
  }
}
