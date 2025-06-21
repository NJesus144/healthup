export interface DoctorRepository {
  createDoctor(data: any): Promise<any>
  getDoctorById(id: string): Promise<any>
  updateDoctor(id: string, data: any): Promise<any>
  getDoctorsBySpecialty(specialty: string): Promise<any[]>
  getAllDoctors(): Promise<any[]>
}
