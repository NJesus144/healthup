import { AdminRepository } from '@/interfaces/repositories/AdminRepository'
import { DashboardDTO } from '@/modules/admin/dtos/DashboardDTO'
import { PendingDoctorDTO } from '@/modules/admin/dtos/PendingDoctorDTO'
import { ConflictError, NotFoundError } from '@/shared/errors/AppError'
import { UserStatus } from '@prisma/client'

export class FakeAdminRepository implements AdminRepository {
  private dashboardMetrics: DashboardDTO = {
    totalAppointments: 150,
    appointmentsToday: 12,
    activeDoctors: 8,
    pendingDoctors: 3,
    totalPatients: 245,
  }

  private pendingDoctors: PendingDoctorDTO[] = [
    {
      id: '1',
      name: 'Dr. Maria Santos',
      email: 'maria.santos@email.com',
      specialization: 'Cardiologia',
      phone: '11987654321',
      crm: '12345-SP',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      status: 'PENDING' as const,
    },
    {
      id: '2',
      name: 'Dr. João Oliveira',
      email: 'joao.oliveira@email.com',
      specialization: 'Dermatologia',
      phone: '11876543210',
      crm: '67890-SP',
      createdAt: new Date('2024-01-14T09:30:00Z'),
      status: 'PENDING' as const,
    },
    {
      id: '3',
      name: 'Dr. Ana Costa',
      email: 'ana.costa@email.com',
      specialization: 'Pediatria',
      phone: '11765432109',
      crm: '54321-SP',
      createdAt: new Date('2024-01-13T14:15:00Z'),
      status: 'PENDING' as const,
    },
  ]

  async getDashboardMetrics(): Promise<DashboardDTO> {
    return this.dashboardMetrics
  }

  async getPendingDoctors(): Promise<PendingDoctorDTO[]> {
    return this.pendingDoctors.filter(doctor => doctor.status === 'PENDING')
  }

  async updateDoctorStatus(id: string, status: UserStatus): Promise<void> {
    const doctorIndex = this.pendingDoctors.findIndex(doctor => doctor.id === id)
    if (doctorIndex === -1) {
      throw new NotFoundError('Doctor not found')
    }

    if (this.pendingDoctors[doctorIndex].status !== 'PENDING') {
      throw new ConflictError('Doctor status must be PENDING to update')
    }

    this.pendingDoctors[doctorIndex].status = status as any
  }

  resetData(): void {
    this.dashboardMetrics = {
      totalAppointments: 150,
      appointmentsToday: 12,
      activeDoctors: 8,
      pendingDoctors: 3,
      totalPatients: 245,
    }

    this.pendingDoctors = [
      {
        id: '1',
        name: 'Dr. Maria Santos',
        email: 'maria.santos@email.com',
        specialization: 'Cardiologia',
        phone: '11987654321',
        crm: '12345-SP',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        status: 'PENDING' as const,
      },
      {
        id: '2',
        name: 'Dr. João Oliveira',
        email: 'joao.oliveira@email.com',
        specialization: 'Dermatologia',
        phone: '11876543210',
        crm: '67890-SP',
        createdAt: new Date('2024-01-14T09:30:00Z'),
        status: 'PENDING' as const,
      },
      {
        id: '3',
        name: 'Dr. Ana Costa',
        email: 'ana.costa@email.com',
        specialization: 'Pediatria',
        phone: '11765432109',
        crm: '54321-SP',
        createdAt: new Date('2024-01-13T14:15:00Z'),
        status: 'PENDING' as const,
      },
    ]
  }
}
