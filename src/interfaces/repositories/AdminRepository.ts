import { PendingDoctorDTO } from '@/modules/admin/dtos/PendingDoctorDTO'
import { DashboardDTO } from '@/modules/admin/dtos/DashboardDTO'
import { UserStatus } from '@prisma/client'
import { Doctor } from '@/modules/doctors/models/Doctor'

export interface AdminRepository {
  getDashboardMetrics(): Promise<DashboardDTO>
  getPendingDoctors(): Promise<PendingDoctorDTO[]>
  updateDoctorStatus(id: string, status: UserStatus): Promise<Doctor>
}
