import { CreateDoctorDTO } from '@/modules/doctors/dtos/createDoctorDTO'

export interface DoctorService {
  createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<any>
  getDoctorById(id: string): Promise<any>
  updateDoctor(id: string, data: any): Promise<any>
  getDoctorsBySpecialty(specialty: string): Promise<any[]>
  getAllDoctors(): Promise<any[]>
  // deleteDoctor(id: string): Promise<void>
}
