import {cpf, cnpj} from 'cpf-cnpj-validator'

export class DocumentValidator {
  static validateCPF(value: string): boolean {
    return cpf.isValid(value)
  }
}