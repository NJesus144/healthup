import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { UpdateDoctorDTO } from '@/modules/doctors/dtos/UpdateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { GetDoctorsQueryDTO } from '@/modules/doctors/validators/validateQueryParameters'

export interface DoctorService {
  createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<Doctor>
  getDoctorById(id: string): Promise<Doctor>
  updateDoctor(id: string, updateDoctorDTO: UpdateDoctorDTO): Promise<Doctor>
  findAllAvailableDoctors(filters: GetDoctorsQueryDTO): Promise<Doctor[]>
  getDoctorByEmail(email: string): Promise<PrismaDoctor | null>
}
