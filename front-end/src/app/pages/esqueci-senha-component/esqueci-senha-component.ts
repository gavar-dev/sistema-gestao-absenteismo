import { CommonModule } from '@angular/common';

import { HttpErrorResponse } from '@angular/common/http';

import { Component } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { TimeoutError, timeout } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

import { RecuperarSenhaRequest } from '../../models/auth';

@Component({
  selector: 'app-esqueci-senha-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './esqueci-senha-component.html',
  styleUrl: './esqueci-senha-component.css',
})
export class EsqueciSenhaComponent {
  readonly formulario: FormGroup;

  mostrarNovaSenha = false;
  mostrarConfirmacao = false;

  salvando = false;

  erro = '';
  sucesso = '';

  constructor(
    private readonly formBuilder: FormBuilder,

    private readonly authService: AuthService,

    private readonly router: Router,
  ) {
    this.formulario = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],

      cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],

      matricula: ['', [Validators.required, Validators.maxLength(30)]],

      dataNascimento: ['', [Validators.required]],

      novaSenha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],

      confirmacaoSenha: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
      ],
    });
  }

  get f(): {
    [key: string]: AbstractControl;
  } {
    return this.formulario.controls;
  }

  get forcaSenha(): number {
    const senha = String(this.f['novaSenha'].value ?? '');

    let pontuacao = 0;

    if (senha.length >= 8) {
      pontuacao += 25;
    }

    if (/[A-Z]/.test(senha)) {
      pontuacao += 25;
    }

    if (/[0-9]/.test(senha)) {
      pontuacao += 25;
    }

    if (/[^A-Za-z0-9]/.test(senha)) {
      pontuacao += 25;
    }

    return pontuacao;
  }

  get rotuloForcaSenha(): string {
    if (this.forcaSenha === 100) {
      return 'Forte';
    }

    if (this.forcaSenha >= 75) {
      return 'Boa';
    }

    if (this.forcaSenha >= 50) {
      return 'Média';
    }

    return 'Fraca';
  }

  campoInvalido(nome: string): boolean {
    const campo = this.formulario.get(nome);

    return Boolean(campo && campo.invalid && (campo.touched || campo.dirty));
  }

  alternarNovaSenha(): void {
    this.mostrarNovaSenha = !this.mostrarNovaSenha;
  }

  alternarConfirmacao(): void {
    this.mostrarConfirmacao = !this.mostrarConfirmacao;
  }

  recuperar(): void {
    if (this.salvando) {
      return;
    }

    this.erro = '';
    this.sucesso = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      this.erro = 'Revise os campos e tente novamente.';

      return;
    }

    const email = String(this.f['email'].value).trim().toLowerCase();

    const cpf = String(this.f['cpf'].value).replace(/\D/g, '');

    const matricula = String(this.f['matricula'].value).trim();

    const dataNascimento = String(this.f['dataNascimento'].value);

    const novaSenha = String(this.f['novaSenha'].value);

    const confirmacaoSenha = String(this.f['confirmacaoSenha'].value);

    if (novaSenha !== confirmacaoSenha) {
      this.erro = 'A confirmação não corresponde à nova senha.';

      return;
    }

    const request: RecuperarSenhaRequest = {
      email,
      cpf,
      matricula,
      dataNascimento,
      novaSenha,
      confirmacaoSenha,
    };

    this.salvando = true;

    this.authService
      .recuperarSenha(request)
      .pipe(timeout(10000))
      .subscribe({
        next: (): void => {
          this.sucesso = 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.';

          this.salvando = false;

          this.formulario.disable();

          window.setTimeout((): void => {
            void this.router.navigate(['/login']);
          }, 1800);
        },

        error: (erro: unknown): void => {
          console.error('Erro ao recuperar senha:', erro);

          this.erro = this.obterMensagemErro(erro);

          this.salvando = false;
        },
      });
  }

  private obterMensagemErro(erro: unknown): string {
    if (erro instanceof TimeoutError) {
      return 'O servidor demorou muito para responder.';
    }

    if (!(erro instanceof HttpErrorResponse)) {
      return 'Não foi possível redefinir a senha.';
    }

    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    if (erro.status === 401) {
      return 'Os dados informados não correspondem ao cadastro do funcionário.';
    }

    if (erro.status === 403) {
      if (typeof erro.error?.mensagem === 'string') {
        return erro.error.mensagem;
      }

      return 'Este usuário não pode recuperar a senha.';
    }

    if (typeof erro.error?.mensagem === 'string') {
      return erro.error.mensagem;
    }

    return 'Não foi possível redefinir a senha.';
  }
}
