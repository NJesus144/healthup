import { FakeDoctorRepository } from '@/interfaces/repositories/fake_doctor_repository'
import { DoctorServiceImp } from '@/modules/doctors/services/DoctorServiceImp'
import { MedicalSpecialty, UserStatus } from '@prisma/client'

describe('Doctor Service', () => {
  let doctorService: DoctorServiceImp
  let fakeDoctorRepository: FakeDoctorRepository

  beforeEach(() => {
    fakeDoctorRepository = new FakeDoctorRepository()
    doctorService = new DoctorServiceImp(fakeDoctorRepository)
  })

  describe('createDoctor', () => {
    it('should return 409 when trying to create a doctor with an existing email', async () => {
      const existingDoctorData = {
        name: 'João Silva',
        email: 'drjoaoSilva@gmail.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        specialty: MedicalSpecialty.CARDIOLOGY,
        status: UserStatus.PENDING,
        cpf: '44180672057',
        crm: '123456-SP',
      }

      await expect(doctorService.createDoctor(existingDoctorData)).rejects.toThrow('Email already exists')
    })

    it('should return ConflictError 409 when trying to create a doctor with an existing CPF', async () => {
      const existingDoctorCPF = {
        name: 'João Silva',
        email: 'drjoaoSilva@gmail.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        specialty: MedicalSpecialty.CARDIOLOGY,
        status: UserStatus.PENDING,
        cpf: '38823074045',
        crm: '123456-SP',
      }

      await expect(doctorService.createDoctor(existingDoctorCPF)).rejects.toThrow('CPF already exists')
    })

    it('should return 400 when trying to create a doctor with an invalid CPF', async () => {
      const existingDoctorCPF = {
        name: 'João Silva',
        email: 'drjoaoSilva@gmail.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        specialty: MedicalSpecialty.CARDIOLOGY,
        status: UserStatus.PENDING,
        cpf: '23453452-456',
        crm: '123456-SP',
      }

      await expect(doctorService.createDoctor(existingDoctorCPF)).rejects.toThrow('Invalid CPF format')
    })

    it('should create a doctor with valid data', async () => {
      const existingDoctorData = {
        name: 'Dr. João Silva',
        email: 'drjoaoSilva2@gmail.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        specialty: MedicalSpecialty.CARDIOLOGY,
        status: UserStatus.PENDING,
        cpf: '11942527020',
        crm: '123456-SP',
      }

      const createdDoctor = await doctorService.createDoctor(existingDoctorData)

      expect(createdDoctor).toBeDefined()
      expect(createdDoctor.name).toBe(existingDoctorData.name)
      expect(createdDoctor.email).toBe(existingDoctorData.email)
      expect(createdDoctor.specialty).toBe(existingDoctorData.specialty)
      expect(createdDoctor.status).toBe(existingDoctorData.status)
      expect(createdDoctor.cpf).toBe(existingDoctorData.cpf)
    })
  })

  describe('getDoctorById', () => {
    it('should throw NotFoundError when no doctor is found', async () => {
      await expect(doctorService.getDoctorById('non-existing-id')).rejects.toThrow('User not found')
    })

    it('should return a doctor when found', async () => {
      const doctor = await doctorService.getDoctorById('1')

      expect(doctor).not.toBeNull()
      expect(doctor?.id).toBe('1')
      expect(doctor?.name).toBe('Dr. João Silva')
    })
  })

  describe('updateDoctor', () => {
    it('should throw NotFoundError when trying to update a non-existent doctor', async () => {
      const doctorData = {
        name: 'new name',
      }

      await expect(doctorService.updateDoctor('12009', doctorData)).rejects.toThrow('User not found')
    })

    it('should successfully update an existing doctor', async () => {
      const updateDate = {
        name: 'Updated Name',
      }

      const updatedDoctor = await doctorService.updateDoctor('1', updateDate)

      expect(updatedDoctor).toBeDefined()
      expect(updatedDoctor.name).toBe(updateDate.name)
    })
  })

  describe('getAvailableDoctors', () => {
    it('should return all available doctors', async () => {
      const doctors = await doctorService.findAllAvailableDoctors()

      expect(doctors).toBeDefined()
      expect(doctors.length).toBeGreaterThan(0)
      expect(doctors[0].name).toBe('Dr. João Silva')
    })
  })
})
