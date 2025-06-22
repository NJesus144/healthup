import { AuthenticatableEntity, AuthType } from '@/interfaces/auth/AuthenticableEntity'

export interface AuthenticationStrategy {
  findByEmail(email: string): Promise<AuthenticatableEntity | null>
  findById(id: string): Promise<AuthenticatableEntity | null>
  getUserType(): AuthType
}
