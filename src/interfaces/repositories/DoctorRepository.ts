import { CreateBloquedDateDTO } from '@/modules/doctors/dtos/CreateBloquedDateDTO'
import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { GetDoctorsQueryDTO } from '@/modules/doctors/validators/validateQueryParameters'
import { BlockedDate } from '@prisma/client'

export interface DoctorRepository {
  createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<Doctor>
  getDoctorById(id: string): Promise<Doctor | null>
  updateDoctor(id: string, updateDoctorDTO: UpdateDoctorDTO): Promise<Doctor>
  findDoctorByCPF(cpf: string): Promise<Doctor | null>
  getDoctorByEmail(email: string): Promise<PrismaDoctor | null>
  findAllAvailableDoctors(filter: GetDoctorsQueryDTO): Promise<Doctor[]>
  blockedDate(doctorId: string, date: CreateBloquedDateDTO): Promise<BlockedDate>
  getBlockedDates(doctorId: string, startDate: Date, endDate: Date): Promise<Date[]>
  cancelBlockedDate(doctorId: string, date: Date): Promise<BlockedDate>
  getAllBlockedDates(doctorId: string): Promise<Date[]>
  countDoctors(): Promise<number>
}
