import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cpfEhValido(valor: unknown): boolean {
  const cpf = String(valor ?? '').replace(/\D/g, '');

  if (cpf.length !== 11) {
    return false;
  }

  /*
   * Bloqueia sequências:
   * 00000000000
   * 11111111111
   * 22222222222
   * etc.
   */
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;

  for (let indice = 0; indice < 9; indice += 1) {
    soma += Number(cpf.charAt(indice)) * (10 - indice);
  }

  let primeiroDigito = (soma * 10) % 11;

  if (primeiroDigito === 10) {
    primeiroDigito = 0;
  }

  if (primeiroDigito !== Number(cpf.charAt(9))) {
    return false;
  }

  soma = 0;

  for (let indice = 0; indice < 10; indice += 1) {
    soma += Number(cpf.charAt(indice)) * (11 - indice);
  }

  let segundoDigito = (soma * 10) % 11;

  if (segundoDigito === 10) {
    segundoDigito = 0;
  }

  return segundoDigito === Number(cpf.charAt(10));
}

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;

  /*
   * O Validators.required fica
   * responsável pelo campo vazio.
   */
  if (valor === null || valor === undefined || String(valor).trim() === '') {
    return null;
  }

  return cpfEhValido(valor) ? null : {cpfInvalido: true,};
};
