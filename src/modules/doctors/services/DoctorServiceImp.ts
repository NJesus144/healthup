import { DoctorRepository } from '@/interfaces/repositories/DoctorRepository'
import { DoctorService } from '@/interfaces/services/DoctorService'
import { CreateDoctorDTO } from '@/modules/doctors/dtos/CreateDoctorDTO'
import { Doctor } from '@/modules/doctors/models/Doctor'
import { PrismaDoctor } from '@/modules/doctors/repositories/DoctorRepositoryImp'
import { GetDoctorsQueryDTO } from '@/modules/doctors/validators/validateQueryParameters'
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/AppError'
import { DocumentValidator } from '@/shared/utils/documentValidator'
import { MedicalSpecialty, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

export class DoctorServiceImp implements DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async createDoctor(createDoctorDTO: CreateDoctorDTO): Promise<Doctor> {
    if (!DocumentValidator.validateCPF(createDoctorDTO.cpf)) throw new BadRequestError('Invalid CPF format')

    const existingCPF = await this.doctorRepository.findDoctorByCPF(createDoctorDTO.cpf)

    if (existingCPF) throw new ConflictError('CPF already exists')

    const existingEmail = await this.doctorRepository.getDoctorByEmail(createDoctorDTO.email)

    if (existingEmail) throw new ConflictError('Email already exists')

    const passwordHash = await bcrypt.hash(createDoctorDTO.passwordHash, 10)

    const doctorData = {
      ...createDoctorDTO,
      status: UserStatus.PENDING,
      role: UserRole.DOCTOR,
      passwordHash,
    }

    return this.doctorRepository.createDoctor(doctorData)
  }

  async getDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.getDoctorById(id)

    if (!doctor) throw new NotFoundError('User not found')

    return doctor
  }

  async updateDoctor(id: string, updateDoctorDTO: any): Promise<Doctor> {
    const doctor = await this.getDoctorById(id)

    if (!doctor) throw new NotFoundError('User not found')

    return await this.doctorRepository.updateDoctor(id, updateDoctorDTO)
  }

  async findAllAvailableDoctors(queryDto?: GetDoctorsQueryDTO): Promise<Doctor[]> {
    if (!queryDto) {
      return await this.doctorRepository.findAllAvailableDoctors({})
    }

    const filters = {
      specialty: queryDto.specialty as MedicalSpecialty | undefined,
      status: (queryDto.status as UserStatus) || UserStatus.ACTIVE,
      pagination:
        queryDto.page && queryDto.limit
          ? {
              page: queryDto.page,
              limit: queryDto.limit,
            }
          : undefined,
    }

    return await this.doctorRepository.findAllAvailableDoctors(filters)
  }

  async getDoctorByEmail(email: string): Promise<PrismaDoctor | null> {
    const doctor = await this.doctorRepository.getDoctorByEmail(email)
    return doctor
  }
}
