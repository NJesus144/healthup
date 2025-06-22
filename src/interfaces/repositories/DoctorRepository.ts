import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { GetDoctorsQueryDTO } from '@/modules/doctors/validators/validateQueryParameters'

export interface DoctorRepository {
  createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<Doctor>
  getDoctorById(id: string): Promise<Doctor | null>
  updateDoctor(id: string, createDoctorDTO: CreateDoctorDTO): Promise<Doctor>
  findDoctorByCPF(cpf: string): Promise<Doctor | null>
  getDoctorByEmail(email: string): Promise<PrismaDoctor | null>
  findAllAvailableDoctors(filter: GetDoctorsQueryDTO): Promise<Doctor[]>
}
