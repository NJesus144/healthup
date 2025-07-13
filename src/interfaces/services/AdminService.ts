import { PendingDoctorDTO } from '@/modules/admin/dtos/PendingDoctorDTO'
import { DashboardDTO } from '@/modules/admin/dtos/DashboardDTO'
import { UpdateDoctorStatusDTO } from '@/modules/admin/dtos/UpdateDoctorStatusDTO'

export interface AdminService {
  getDashboardMetrics(): Promise<DashboardDTO>
  getPendingDoctors(): Promise<PendingDoctorDTO[]>
  updateDoctorStatus(id: string, data: UpdateDoctorStatusDTO): Promise<void>
}
