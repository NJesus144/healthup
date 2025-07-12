import { FakeAppointmentRepository } from '@/interfaces/repositories/fake_appointmentRepository'
import { FakeDoctorRepository } from '@/interfaces/repositories/fake_doctor_repository'
import { DoctorServiceImp } from '@/modules/doctors/services/DoctorServiceImp'
import { MedicalSpecialty, UserStatus } from '@prisma/client'

describe('Doctor Service', () => {
  let doctorService: DoctorServiceImp
  let fakeDoctorRepository: FakeDoctorRepository
  let fakeAppointmentRepository: FakeAppointmentRepository

  beforeEach(() => {
    fakeDoctorRepository = new FakeDoctorRepository()
    fakeAppointmentRepository = new FakeAppointmentRepository()
    doctorService = new DoctorServiceImp(fakeDoctorRepository, fakeAppointmentRepository)
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
      await expect(doctorService.getDoctorById('non-existing-id')).rejects.toThrow('Doctor not found')
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

      await expect(doctorService.updateDoctor('12009', doctorData)).rejects.toThrow('Doctor not found')
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

  describe('blockedDate', () => {
    it('should successfully block a date for a doctor', async () => {
      const blockDateData = {
        date: new Date('2025-08-15'),
        reason: 'Férias',
      }

      const blockedDate = await doctorService.blockedDate('1', blockDateData)

      expect(blockedDate).toBeDefined()
      expect(blockedDate.doctorId).toBe('1')
      expect(blockedDate.reason).toBe('Férias')
      expect(blockedDate.date).toBeDefined()
    })

    it('should throw NotFoundError when trying to block date for non-existent doctor', async () => {
      const blockDateData = {
        date: new Date('2025-08-15'),
        reason: 'Férias',
      }

      await expect(doctorService.blockedDate('non-existing-id', blockDateData)).rejects.toThrow('Doctor not found')
    })

    it('should throw ConflictError when trying to block an already blocked date', async () => {
      const blockDateData = {
        date: new Date('2025-08-15'),
        reason: 'Férias',
      }

      await doctorService.blockedDate('1', blockDateData)

      await expect(doctorService.blockedDate('1', blockDateData)).rejects.toThrow('This date is already blocked')
    })

    it('should block a date without reason', async () => {
      const blockDateData = {
        date: new Date('2025-08-20'),
      }

      const blockedDate = await doctorService.blockedDate('1', blockDateData)

      expect(blockedDate).toBeDefined()
      expect(blockedDate.doctorId).toBe('1')
      expect(blockedDate.reason).toBeNull()
    })

    it('should handle timezone conversion correctly when blocking a date', async () => {
      const blockDateData = {
        date: new Date('2025-08-15T10:00:00.000Z'),
        reason: 'Test timezone',
      }

      const blockedDate = await doctorService.blockedDate('1', blockDateData)

      expect(blockedDate).toBeDefined()
      expect(blockedDate.doctorId).toBe('1')
      expect(blockedDate.reason).toBe('Test timezone')
      expect(blockedDate.date).toBeDefined()
    })

    it('should detect conflict when blocking same date with different times', async () => {
      const blockDateData1 = {
        date: new Date('2025-08-15T08:00:00.000Z'),
        reason: 'Morning block',
      }

      const blockDateData2 = {
        date: new Date('2025-08-15T20:00:00.000Z'),
        reason: 'Evening block',
      }

      await doctorService.blockedDate('1', blockDateData1)

      await expect(doctorService.blockedDate('1', blockDateData2)).rejects.toThrow('This date is already blocked')
    })
  })

  describe('cancelBlockedDate', () => {
    it('should successfully cancel a blocked date', async () => {
      const blockDateData = {
        date: new Date('2025-08-15'),
        reason: 'Férias',
      }

      await doctorService.blockedDate('1', blockDateData)

      const canceledDate = await doctorService.cancelBlockedDate('1', blockDateData.date)

      expect(canceledDate).toBeDefined()
      expect(canceledDate.doctorId).toBe('1')
    })

    it('should throw NotFoundError when trying to cancel non-existent blocked date', async () => {
      const date = new Date('2025-08-15')

      await expect(doctorService.cancelBlockedDate('1', date)).rejects.toThrow('This date is not blocked')
    })

    it('should throw NotFoundError when trying to cancel blocked date for non-existent doctor', async () => {
      const date = new Date('2025-08-15')

      await expect(doctorService.cancelBlockedDate('non-existing-id', date)).rejects.toThrow('Doctor not found')
    })
  })

  describe('getBlockedDates', () => {
    it('should return empty array when doctor has no blocked dates', async () => {
      const blockedDates = await doctorService.getBlockedDates('1')

      expect(blockedDates).toBeDefined()
      expect(blockedDates).toEqual([])
    })

    it('should return blocked dates for a doctor', async () => {
      const blockDateData1 = {
        date: new Date('2025-08-15'),
        reason: 'Férias',
      }

      const blockDateData2 = {
        date: new Date('2025-08-20'),
        reason: 'Conferência',
      }

      await doctorService.blockedDate('1', blockDateData1)
      await doctorService.blockedDate('1', blockDateData2)

      const blockedDates = await doctorService.getBlockedDates('1')

      expect(blockedDates).toBeDefined()
      expect(blockedDates.length).toBe(2)

      const blockedDatesOnly = blockedDates.map(date => date.toISOString().split('T')[0])
      const expectedDate1 = blockDateData1.date.toISOString().split('T')[0]
      const expectedDate2 = blockDateData2.date.toISOString().split('T')[0]

      expect(blockedDatesOnly).toContain(expectedDate1)
      expect(blockedDatesOnly).toContain(expectedDate2)
    })

    it('should throw NotFoundError when trying to get blocked dates for non-existent doctor', async () => {
      await expect(doctorService.getBlockedDates('non-existing-id')).rejects.toThrow('Doctor not found')
    })
  })

  describe('getDoctorAvailability', () => {
    it('should return availability for a doctor with no blocked dates or appointments', async () => {
      const availability = await doctorService.getDoctorAvailability('1')

      expect(availability).toBeDefined()
      expect(availability.doctorId).toBe('1')
      expect(availability.period).toBeDefined()
      expect(availability.period.startDate).toBeDefined()
      expect(availability.period.endDate).toBeDefined()
      expect(availability.availability).toBeDefined()
      expect(availability.availability.length).toBeGreaterThan(0)
    })

    it('should return availability with blocked dates marked as unavailable', async () => {
      const blockDateData = {
        date: new Date('2025-08-15'),
        reason: 'Férias',
      }

      await doctorService.blockedDate('1', blockDateData)

      const availability = await doctorService.getDoctorAvailability('1')

      const blockedDateAvailability = availability.availability.find(
        day => day.date.toISOString().split('T')[0] === blockDateData.date.toISOString().split('T')[0]
      )

      expect(blockedDateAvailability).toBeDefined()
      expect(blockedDateAvailability?.times).toEqual([])
    })

    it('should throw NotFoundError when trying to get availability for non-existent doctor', async () => {
      await expect(doctorService.getDoctorAvailability('non-existing-id')).rejects.toThrow('Doctor not found')
    })

    it('should return availability with proper time slots for non-blocked dates', async () => {
      const availability = await doctorService.getDoctorAvailability('1')

      const availableDay = availability.availability.find(day => day.times.length > 0)

      expect(availableDay).toBeDefined()
      expect(availableDay?.times.length).toBeGreaterThan(0)
      expect(availableDay?.times[0]).toHaveProperty('time')
      expect(availableDay?.times[0]).toHaveProperty('available')
    })
  })
})
