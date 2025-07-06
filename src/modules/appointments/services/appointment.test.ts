import { FakeAppointmentRepository } from '@/interfaces/repositories/fake_appointmentRepository'
import { AppointmentServiceImp } from './AppointmentServiceImp'
import { AppointmentStatus, UserRole } from '@prisma/client'
import { parseISO } from 'date-fns'
import { FakeDoctorRepository } from '@/interfaces/repositories/fake_doctor_repository'
import { fromZonedTime } from 'date-fns-tz'

describe('Appointment Service', () => {
  let appointmentService: AppointmentServiceImp
  let fakeAppointmentRepository: FakeAppointmentRepository
  let fakeDoctorRepository: FakeDoctorRepository

  beforeEach(() => {
    fakeAppointmentRepository = new FakeAppointmentRepository()
    fakeDoctorRepository = new FakeDoctorRepository()
    appointmentService = new AppointmentServiceImp(fakeAppointmentRepository, fakeDoctorRepository)
  })

  describe('createAppointment', () => {
    it('should create an appointment with valid data', async () => {
      const appointmentData = {
        patientId: 'patient-3',
        doctorId: 'doctor-2',
        date: '2024-12-15',
        time: '14:00',
        notes: 'Consulta de retorno',
      }

      const newAppointment = await appointmentService.createAppointment(appointmentData)

      expect(newAppointment.patientId).toBe(appointmentData.patientId)
      expect(newAppointment.doctorId).toBe(appointmentData.doctorId)

      const appointmentDateOnly = newAppointment.date.toISOString().split('T')[0]
      const expectedDateOnly = parseISO(appointmentData.date).toISOString().split('T')[0]

      expect(appointmentDateOnly).toBe(expectedDateOnly)
      expect(newAppointment.time).toBe(appointmentData.time)
      expect(newAppointment.status).toBe(AppointmentStatus.SCHEDULED)
    })

    it('should throw ConflictError when time slot is already booked', async () => {
      const appointmentData = {
        patientId: 'patient-3',
        doctorId: 'doctor-1',
        date: '2024-12-01',
        time: '09:00',
        notes: 'Consulta',
      }

      await expect(appointmentService.createAppointment(appointmentData)).rejects.toThrow('This time slot is already booked')
    })

    it('should throw ConflictError when date is blocked for the doctor', async () => {
      const appointmentData = {
        patientId: 'patient-3',
        doctorId: 'doctor-1',
        date: '2024-12-25',
        time: '14:00',
        notes: 'Consulta',
      }
      const dateIso = fromZonedTime('2024-12-25', 'America/Sao_Paulo')
      await fakeDoctorRepository.blockedDate('doctor-1', { date: dateIso, reason: 'Feriado de Natal' })

      await expect(appointmentService.createAppointment(appointmentData)).rejects.toThrow('This date is blocked for the doctor')
    })

    it('should create appointment when slot is available and date is not blocked', async () => {
      const appointmentData = {
        patientId: 'patient-3',
        doctorId: 'doctor-1',
        date: '2024-12-15',
        time: '15:00',
        notes: 'Consulta de rotina',
      }

      const newAppointment = await appointmentService.createAppointment(appointmentData)

      expect(newAppointment).toBeDefined()
      expect(newAppointment.patientId).toBe(appointmentData.patientId)
      expect(newAppointment.doctorId).toBe(appointmentData.doctorId)
    })
  })

  describe('getAppointmentById', () => {
    it('should return an appointment when found', async () => {
      const appointment = await appointmentService.getAppointmentById('1')

      expect(appointment).toBeDefined()
      expect(appointment.id).toBe('1')
      expect(appointment.patient).toBeDefined()
      expect(appointment.doctor).toBeDefined()
      expect(appointment.patient.name).toBe('João Silva')
      expect(appointment.doctor.name).toBe('Dr. Maria Santos')
    })

    it('should throw NotFoundError when appointment does not exist', async () => {
      await expect(appointmentService.getAppointmentById('non-existing-id')).rejects.toThrow('Appointment not found')
    })
  })

  describe('updateAppointment', () => {
    it('should update an existing appointment', async () => {
      const updateData = {
        date: '2024-12-02',
        time: '10:30',
        notes: 'Updated notes',
        status: AppointmentStatus.COMPLETED,
      }

      const updatedAppointment = await appointmentService.updateAppointment('1', updateData)

      expect(updatedAppointment).toBeDefined()
      expect(updatedAppointment.date).toBe(updateData.date)
      expect(updatedAppointment.time).toBe(updateData.time)
      expect(updatedAppointment.notes).toBe(updateData.notes)
      expect(updatedAppointment.status).toBe(updateData.status)
    })

    it('should throw NotFoundError when trying to update non-existent appointment', async () => {
      const updateData = {
        notes: 'Updated notes',
      }

      await expect(appointmentService.updateAppointment('non-existing-id', updateData)).rejects.toThrow('Appointment not found')
    })

    it('should update only provided fields', async () => {
      const updateData = {
        notes: 'Only notes updated',
      }

      const updatedAppointment = await appointmentService.updateAppointment('1', updateData)

      expect(updatedAppointment.notes).toBe('Only notes updated')
      expect(updatedAppointment.date).toEqual(parseISO('2024-12-01'))
      expect(updatedAppointment.time).toBe('09:00')
    })
  })

  describe('deleteAppointment', () => {
    it('should delete an existing appointment', async () => {
      await appointmentService.deleteAppointment('1')
      await expect(appointmentService.getAppointmentById('1')).rejects.toThrow('Appointment not found')
    })

    it('should throw NotFoundError when trying to delete non-existent appointment', async () => {
      await expect(appointmentService.deleteAppointment('non-existing-id')).rejects.toThrow('Appointment not found')
    })
  })

  describe('getMyAppointments', () => {
    it('should return appointments for a patient', async () => {
      const appointments = await appointmentService.getMyAppointments('patient-1', UserRole.PATIENT)

      expect(appointments).toHaveLength(1)
      expect(appointments[0].patientId).toBe('patient-1')
      expect(appointments[0].patient.name).toBe('João Silva')
    })

    it('should return appointments for a doctor', async () => {
      const appointments = await appointmentService.getMyAppointments('doctor-1', UserRole.DOCTOR)

      expect(appointments).toHaveLength(2)
      expect(appointments[0].doctorId).toBe('doctor-1')
      expect(appointments[1].doctorId).toBe('doctor-1')
    })

    it('should return empty array for user with no appointments', async () => {
      const appointments = await appointmentService.getMyAppointments('non-existing-user', UserRole.PATIENT)

      expect(appointments).toHaveLength(0)
    })

    it('should return empty array for invalid user role', async () => {
      const appointments = await appointmentService.getMyAppointments('patient-1', UserRole.ADMIN)

      expect(appointments).toHaveLength(0)
    })

    it('should return appointments for specific patient only', async () => {
      const appointments = await appointmentService.getMyAppointments('patient-2', UserRole.PATIENT)

      expect(appointments).toHaveLength(1)
      expect(appointments[0].patientId).toBe('patient-2')
      expect(appointments[0].patient.name).toBe('Maria Clara')
    })

    it('should return all appointments for a doctor with multiple patients', async () => {
      const appointments = await appointmentService.getMyAppointments('doctor-1', UserRole.DOCTOR)

      expect(appointments).toHaveLength(2)
      expect(appointments.every(app => app.doctorId === 'doctor-1')).toBe(true)

      const patientIds = appointments.map(app => app.patientId)
      expect(patientIds).toContain('patient-1')
      expect(patientIds).toContain('patient-2')
    })
  })
})
