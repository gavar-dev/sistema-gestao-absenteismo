import {
  CommonModule,
  DOCUMENT,
} from '@angular/common';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';

import { Router } from '@angular/router';

import {
  EMPTY,
  TimeoutError,
  catchError,
  finalize,
  switchMap,
  timeout,
} from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

import { FuncionarioService } from '../../core/services/funcionario';

import { UsuarioLogadoService } from '../../core/services/usuario-logado.service';

type Tema = 'light' | 'dark';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent implements OnInit {

  senhaVisivel = false;
  temaAtual: Tema = 'light';

  carregando = false;
  mensagemErro = '';

  constructor(
    private readonly router: Router,

    private readonly authService:
      AuthService,

    private readonly funcionarioService:
      FuncionarioService,

    private readonly usuarioLogadoService:
      UsuarioLogadoService,

    @Inject(DOCUMENT)
    private readonly document: Document
  ) {}

  ngOnInit(): void {
    const temaSalvo =
      localStorage.getItem(
        'tema'
      ) as Tema | null;

    this.aplicarTema(
      temaSalvo === 'dark'
        ? 'dark'
        : 'light'
    );
  }

  alternarTema(): void {
    const proximoTema: Tema =
      this.temaAtual === 'dark'
        ? 'light'
        : 'dark';

    this.aplicarTema(proximoTema);
  }

  alternarVisibilidade(): void {
    this.senhaVisivel =
      !this.senhaVisivel;
  }

  entrar(
    event: Event,
    email: string,
    senha: string
  ): void {
    event.preventDefault();

    if (this.carregando) {
      return;
    }

    const emailNormalizado =
      email.trim().toLowerCase();

    if (!emailNormalizado || !senha) {
      this.mensagemErro =
        'Informe o e-mail e a senha.';

      return;
    }

    this.carregando = true;
    this.mensagemErro = '';

    this.usuarioLogadoService
      .limparSessao();

    this.authService
      .login({
        email: emailNormalizado,
        senha,
      })
      .pipe(
        /*
         * Encerra a tentativa caso o backend
         * não responda em até 10 segundos.
         */
        timeout(10000),

        /*
         * Depois do login, utiliza o token
         * para consultar o perfil completo.
         */
        switchMap(() =>
          this.funcionarioService
            .buscarMeuPerfil()
            .pipe(
              timeout(10000)
            )
        ),

        /*
         * Trata senha errada, servidor
         * desligado, timeout e demais erros.
         */
        catchError((erro: unknown) => {
          console.error(
            'Erro durante o login:',
            erro
          );

          this.usuarioLogadoService
            .limparSessao();

          this.mensagemErro =
            this.obterMensagemErro(erro);

          return EMPTY;
        }),

        /*
         * Sempre desativa o carregamento,
         * tanto no sucesso quanto no erro.
         */
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe((perfil) => {
        this.usuarioLogadoService
          .definirUsuarioLogado({
            id: perfil.id,
            nome: perfil.nomeCompleto,
            email: perfil.emailCorporativo,
            matricula: perfil.matricula,
            cargo: perfil.cargo,
            setor: perfil.setor,
            iniciais: this.gerarIniciais(
              perfil.nomeCompleto
            ),
            tipo: perfil.tipoAcesso,
          });

        this.router.navigateByUrl(
          this.usuarioLogadoService
            .obterRotaInicial()
        );
      });
  }

  private obterMensagemErro(
    erro: unknown
  ): string {
    if (erro instanceof TimeoutError) {
      return 'O servidor demorou muito para responder.';
    }

    if (!(erro instanceof HttpErrorResponse)) {
      return 'Não foi possível realizar o login.';
    }

    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    if (erro.status === 401) {
      return 'E-mail ou senha inválidos.';
    }

    if (erro.status === 403) {
      if (
        typeof erro.error?.mensagem
        === 'string'
      ) {
        return erro.error.mensagem;
      }

      return 'Este usuário não possui acesso ao sistema.';
    }

    /*
     * Seu backend utiliza a propriedade
     * "mensagem", não "message".
     */
    if (
      typeof erro.error?.mensagem
      === 'string'
    ) {
      return erro.error.mensagem;
    }

    return 'Não foi possível realizar o login.';
  }

  private gerarIniciais(
    nome: string
  ): string {
    return nome
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) =>
        parte.charAt(0).toUpperCase()
      )
      .join('');
  }

  private aplicarTema(
    tema: Tema
  ): void {
    this.temaAtual = tema;

    this.document
      .documentElement
      .setAttribute(
        'data-bs-theme',
        tema
      );

    localStorage.setItem(
      'tema',
      tema
    );
  }
}