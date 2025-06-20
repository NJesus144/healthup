import { FakePatientRepository } from '@/interfaces/repositories/fake_patient_repository'
import { PatientServiceImp } from './PatientServiceImp'

describe('Patient Service', () => {
  let patientService: PatientServiceImp
  let fakePatientRepository: FakePatientRepository

  beforeEach(() => {
    fakePatientRepository = new FakePatientRepository()
    patientService = new PatientServiceImp(fakePatientRepository)
  })

  describe('getPatientById', () => {
    it('should throw NotFoundError when no patient is found', async () => {

      await expect(
        patientService.getPatientById('non-existing-id'),
      ).rejects.toThrow('User not found')
    })

    it('should return a patient when found', async () => {
      const patient = await patientService.getPatientById('1')

      expect(patient).not.toBeNull()
      expect(patient?.id).toBe('1')
      expect(patient?.name).toBe('João Silva')
    })
  })

  describe('createPatient', () => {
    it('should return 409 when trying to create a patient with an existing email', async () => {
      const existingPatientData = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        cpf: '303.387.660-90',
      }

      await expect(
        patientService.createPatient(existingPatientData),
      ).rejects.toThrow('Email already exists')
    })

    it('should return 400 when trying to create a patient with an invalid CPF', async () => {
      const invalidPatientData = {
        name: 'Maria Clara',
        email: 'maria@gamil.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        cpf: '123456789',
      }

      await expect(
        patientService.createPatient(invalidPatientData),
      ).rejects.toThrow('Invalid CPF format')
    })

    it('should return ConflictError 409 when trying to create a patient with an existing CPF', async () => {
      const existingPatientCPF = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        cpf: '52998224725',
      }

      await expect(
        patientService.createPatient(existingPatientCPF),
      ).rejects.toThrow('CPF already exists')
    })

    it('should create a patient with valid data', async () => {
      const patientData = {
        name: 'Julia Frantchesca',
        email: 'julia@gmail.com',
        passwordHash: 'senha123',
        phone: '11999999999',
        cpf: '851.191.510-94',
      }

      const newPatient = await patientService.createPatient(patientData)

      expect(newPatient).toBeDefined()
      expect(newPatient?.name).toBe(patientData.name)
      expect(newPatient?.email).toBe(patientData.email)
    })

    it('should hash the password before saving', async () => {
      const patientData = {
        name: 'test user',
        email: 'test@gmail.com',
        passwordHash: 'plainPassword',
        phone: '123456789',
        cpf: '834.960.510-35',
      }

      const createSpy = jest.spyOn(fakePatientRepository, 'createPatient')

      await patientService.createPatient(patientData)

      const calledWith = createSpy.mock.calls[0][0]
      expect(calledWith.passwordHash).not.toBe('plainPassword')
      expect(calledWith.passwordHash).toMatch(/^\$2[aby]\$10\$/) 
      
      createSpy.mockRestore()
    })
  })

  describe('updatePatient', () => {
    it('should throw NotFoundError when trying to update a non-existent patient', async () => {
      const patientData = {
        name: 'new name',
        phone: '12334556',
      }

      await expect(
        patientService.updatePatient('12009', patientData),
      ).rejects.toThrow('User not found')
    })

    it('should successfully update an existing patient', async () => {
      const updateDate = {
        name: 'Updated Name',
        phone: '123456789',
      }

      const updatedPatient = await patientService.updatePatient('1', updateDate)

      expect(updatedPatient).toBeDefined()
      expect(updatedPatient.name).toBe(updateDate.name)
      expect(updatedPatient.phone).toBe(updateDate.phone)
    })
  })

  describe('getPatientByEmail', () => {
    it('should return patient when email exists', async () => {
      const patient = await patientService.getPatientByEmail('joao@gmail.com')

      expect(patient).not.toBeNull()
      expect(patient?.email).toBe('joao@gmail.com')
    })

    it('should return null when email does not exist', async () => {
      const patient = await patientService.getPatientByEmail(
        'nonexistent@gmail.com',
      )

      expect(patient).toBeNull()
    })
  })
})
