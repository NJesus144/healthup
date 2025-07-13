import { FakeAdminRepository } from '@/interfaces/repositories/fake_admin_repository'
import { FakeDoctorRepository } from '@/interfaces/repositories/fake_doctor_repository'
import { AdminServiceImp } from '@/modules/admin/services/AdminServiceImp'
import { UserStatus } from '@prisma/client'

describe('Admin Service', () => {
  let adminService: AdminServiceImp
  let fakeAdminRepository: FakeAdminRepository
  let fakeDoctorRepository: FakeDoctorRepository

  beforeEach(() => {
    fakeAdminRepository = new FakeAdminRepository()
    fakeDoctorRepository = new FakeDoctorRepository()
    adminService = new AdminServiceImp(fakeAdminRepository, fakeDoctorRepository)
  })

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const metrics = await adminService.getDashboardMetrics()

      expect(metrics).toBeDefined()
      expect(metrics.totalAppointments).toBe(150)
      expect(metrics.appointmentsToday).toBe(12)
      expect(metrics.activeDoctors).toBe(8)
      expect(metrics.pendingDoctors).toBe(3)
      expect(metrics.totalPatients).toBe(245)
    })

    it('should return dashboard metrics with correct structure', async () => {
      const metrics = await adminService.getDashboardMetrics()

      expect(metrics).toHaveProperty('totalAppointments')
      expect(metrics).toHaveProperty('appointmentsToday')
      expect(metrics).toHaveProperty('activeDoctors')
      expect(metrics).toHaveProperty('pendingDoctors')
      expect(metrics).toHaveProperty('totalPatients')
    })
  })

  describe('getPendingDoctors', () => {
    it('should return list of pending doctors', async () => {
      const pendingDoctors = await adminService.getPendingDoctors()

      expect(pendingDoctors).toBeDefined()
      expect(Array.isArray(pendingDoctors)).toBe(true)
      expect(pendingDoctors.length).toBe(3)
    })

    it('should return pending doctors with correct structure', async () => {
      const pendingDoctors = await adminService.getPendingDoctors()

      expect(pendingDoctors[0]).toHaveProperty('id')
      expect(pendingDoctors[0]).toHaveProperty('name')
      expect(pendingDoctors[0]).toHaveProperty('email')
      expect(pendingDoctors[0]).toHaveProperty('specialization')
      expect(pendingDoctors[0]).toHaveProperty('phone')
      expect(pendingDoctors[0]).toHaveProperty('crm')
      expect(pendingDoctors[0]).toHaveProperty('createdAt')
      expect(pendingDoctors[0]).toHaveProperty('status')
    })

    it('should return only doctors with PENDING status', async () => {
      const pendingDoctors = await adminService.getPendingDoctors()

      pendingDoctors.forEach(doctor => {
        expect(doctor.status).toBe('PENDING')
      })
    })

    it('should return doctors ordered by creation date', async () => {
      const pendingDoctors = await adminService.getPendingDoctors()

      expect(pendingDoctors[0].name).toBe('Dr. Maria Santos')
      expect(pendingDoctors[1].name).toBe('Dr. João Oliveira')
      expect(pendingDoctors[2].name).toBe('Dr. Ana Costa')
    })
  })

  describe('updateDoctorStatus', () => {
    const fakeDoctor = {
      id: 'doctor-1',
      name: 'Dr. Test',
      email: 'dr@example.com',
      status: UserStatus.PENDING,
    }
    it('should throw NotFoundError when doctor does not exist', async () => {
      const updateData = { status: UserStatus.PENDING }

      await expect(adminService.updateDoctorStatus('non-existing-id', updateData)).rejects.toThrow('Doctor not found')
    })

    it('should throw ConflictError when doctor status is not PENDING', async () => {
      const updateData = { status: UserStatus.ACTIVE }
      const doctorWithActiveStatus = {
        ...fakeDoctor,
        status: UserStatus.ACTIVE,
      }
      fakeDoctorRepository.getDoctorById = jest.fn().mockResolvedValue(doctorWithActiveStatus)

      await expect(adminService.updateDoctorStatus('2', updateData)).rejects.toThrow('Doctor status must be PENDING to update')
    })

    it('should successfully update doctor status from PENDING to ACTIVE', async () => {
      const updateData = { status: UserStatus.ACTIVE }
      const updateSpy = jest.spyOn(fakeAdminRepository, 'updateDoctorStatus')

      await adminService.updateDoctorStatus('1', updateData)

      expect(updateSpy).toHaveBeenCalledWith('1', UserStatus.ACTIVE)
      expect(updateSpy).toHaveBeenCalledTimes(1)

      updateSpy.mockRestore()
    })

    it('should successfully update doctor status from PENDING to REJECTED', async () => {
      const updateData = { status: UserStatus.REJECTED }
      const updateSpy = jest.spyOn(fakeAdminRepository, 'updateDoctorStatus')

      fakeDoctorRepository.getDoctorById = jest.fn().mockResolvedValue(fakeDoctor)

      await adminService.updateDoctorStatus('3', updateData)

      expect(updateSpy).toHaveBeenCalledWith('3', UserStatus.REJECTED)
      expect(updateSpy).toHaveBeenCalledTimes(1)

      updateSpy.mockRestore()
    })

    it('should call adminRepository.updateDoctorStatus with correct parameters', async () => {
      const updateData = { status: UserStatus.ACTIVE }
      const updateSpy = jest.spyOn(fakeAdminRepository, 'updateDoctorStatus')

      await adminService.updateDoctorStatus('1', updateData)

      expect(updateSpy).toHaveBeenCalledWith('1', UserStatus.ACTIVE)

      updateSpy.mockRestore()
    })

    it('should not throw error when updating valid pending doctor', async () => {
      const updateData = { status: UserStatus.ACTIVE }

      await expect(adminService.updateDoctorStatus('1', updateData)).resolves.not.toThrow()
    })
  })
})
