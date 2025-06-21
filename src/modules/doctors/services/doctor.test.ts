import { FakeDoctorRepository } from '@/interfaces/repositories/fake_doctor_repository'
import { DoctorServiceImp } from '@/modules/doctors/services/DoctorService'
import { MedicalSpecialty, UserStatus } from '@prisma/client'

describe('Doctor Service', () => {
  let doctorService: DoctorServiceImp
  let fakeDoctorRepository: FakeDoctorRepository

  beforeEach(() => {
    fakeDoctorRepository = new FakeDoctorRepository()
    doctorService = new DoctorServiceImp(fakeDoctorRepository)
  })

  describe('createDoctor', () => {
    it('should create a doctor with valid data', async () => {
      const existingDoctorData = {
        name: 'Dr. João Silva',
        email: 'drjoaoSilva@gmail.com',
        passwordHash: 'senha123',
        specialty: MedicalSpecialty.CARDIOLOGIA,
        status: UserStatus.PENDING,
        cpf: '12345678901',
        crm: '123456-SP',
      }

      const createdDoctor = await doctorService.createDoctor(existingDoctorData)

      expect(createdDoctor).toBeDefined()
      expect(createdDoctor.name).toBe(existingDoctorData.name)
      expect(createdDoctor.email).toBe(existingDoctorData.email)
      expect(createdDoctor.specialty).toBe(existingDoctorData.specialty)
      expect(createdDoctor.status).toBe(existingDoctorData.status)
      expect(createdDoctor.cpf).toBe(existingDoctorData.cpf)
      expect(createdDoctor.crm).toBe(existingDoctorData.crm)
    })
  })
})
