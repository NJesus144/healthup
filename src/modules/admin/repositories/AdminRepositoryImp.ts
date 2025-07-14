import { prisma } from '@/config/prisma'
import { PendingDoctorDTO } from '@/modules/admin/dtos/PendingDoctorDTO'
import { DashboardDTO } from '@/modules/admin/dtos/DashboardDTO'
import { AdminRepository } from '@/interfaces/repositories/AdminRepository'
import { UserRole, UserStatus } from '@prisma/client'

export class AdminRepositoryImp implements AdminRepository {
  async getDashboardMetrics(): Promise<DashboardDTO> {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const [totalAppointments, appointmentsToday, activeDoctors, pendingDoctors, totalPatients] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      prisma.user.count({
        where: {
          role: UserRole.DOCTOR,
          status: UserStatus.ACTIVE,
        },
      }),
      prisma.user.count({
        where: {
          role: UserRole.DOCTOR,
          status: UserStatus.PENDING,
        },
      }),
      prisma.user.count({
        where: {
          role: UserRole.PATIENT,
        },
      }),
    ])

    return {
      totalAppointments,
      appointmentsToday,
      activeDoctors,
      pendingDoctors,
      totalPatients,
    }
  }

  async getPendingDoctors(): Promise<PendingDoctorDTO[]> {
    const pendingDoctors = await prisma.user.findMany({
      where: {
        role: UserRole.DOCTOR,
        status: UserStatus.PENDING,
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        phone: true,
        crm: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return pendingDoctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialty || '',
      phone: doctor.phone || '',
      crm: doctor.crm || '',
      createdAt: doctor.createdAt,
      status: doctor.status as 'PENDING',
    }))
  }

  async updateDoctorStatus(id: string, status: UserStatus): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    })
  }
}
