import { CreateBloquedDateDTO } from '@/modules/doctors/dtos/CreateBloquedDateDTO'
import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { GetDoctorAvailabilityDTO } from '@/modules/doctors/dtos/GetDoctorAvailabilityDTO'
import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { GetDoctorsQueryDTO } from '@/modules/doctors/validators/validateQueryParameters'
import { BlockedDate } from '@prisma/client'

export interface DoctorService {
  createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<Doctor>
  getDoctorById(id: string): Promise<Doctor>
  updateDoctor(id: string, updateDoctorDTO: UpdateDoctorDTO): Promise<Doctor>
  findAllAvailableDoctors(filters: GetDoctorsQueryDTO): Promise<Doctor[]>
  getDoctorByEmail(email: string): Promise<PrismaDoctor | null>
  blockedDate(doctorId: string, date: CreateBloquedDateDTO): Promise<BlockedDate>
  cancelBlockedDate(doctorId: string, date: Date): Promise<BlockedDate>
  getDoctorAvailability(doctorId: string): Promise<GetDoctorAvailabilityDTO>
  getBlockedDates(doctorId: string): Promise<Date[]>
}
