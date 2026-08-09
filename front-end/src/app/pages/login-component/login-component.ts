import { CommonModule, DOCUMENT } from '@angular/common';

import { HttpErrorResponse } from '@angular/common/http';

import { Component, Inject, OnInit } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { EMPTY, TimeoutError, catchError, finalize, switchMap, timeout } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

import { FuncionarioService } from '../../core/services/funcionario';

import { UsuarioLogadoService } from '../../core/services/usuario-logado.service';

import { FuncionarioResponse } from '../../models/funcionario';

import { TokenStorageService } from '../../core/services/token-storage.service';

type Tema = 'light' | 'dark';

@Component({
  selector: 'app-login-component',

  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './login-component.html',

  styleUrl: './login-component.css',
})
export class LoginComponent implements OnInit {
  senhaVisivel = false;

  temaAtual: Tema = 'light';

  carregando = false;

  mensagemErro = '';

  primeiroAcessoPendente = false;

  alterandoSenhaPrimeiroAcesso = false;

  mensagemErroPrimeiroAcesso = '';

  nomePrimeiroAcesso = '';

  novaSenhaVisivel = false;

  confirmacaoSenhaVisivel = false;

  constructor(
    private readonly router: Router,

    private readonly authService: AuthService,

    private readonly funcionarioService: FuncionarioService,

    private readonly usuarioLogadoService: UsuarioLogadoService,

    private readonly tokenStorage: TokenStorageService,

    @Inject(DOCUMENT)
    private readonly document: Document,
  ) {}

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('tema') as Tema | null;

    this.aplicarTema(temaSalvo === 'dark' ? 'dark' : 'light');

    /*
     * Recupera o primeiro acesso após
     * F5, reload ou retorno para /login.
     */
    if (this.tokenStorage.ehPrimeiroAcessoPendente()) {
      this.nomePrimeiroAcesso = this.tokenStorage.obterNomeUsuarioToken();

      this.primeiroAcessoPendente = true;
    }
  }

  alternarTema(): void {
    const proximoTema: Tema = this.temaAtual === 'dark' ? 'light' : 'dark';

    this.aplicarTema(proximoTema);
  }

  alternarVisibilidade(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  alternarNovaSenha(): void {
    this.novaSenhaVisivel = !this.novaSenhaVisivel;
  }

  alternarConfirmacaoSenha(): void {
    this.confirmacaoSenhaVisivel = !this.confirmacaoSenhaVisivel;
  }

  entrar(event: Event, email: string, senha: string): void {
    event.preventDefault();

    if (this.carregando) {
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !senha) {
      this.mensagemErro = 'Informe o e-mail e a senha.';

      return;
    }

    this.carregando = true;

    this.mensagemErro = '';

    this.mensagemErroPrimeiroAcesso = '';

    this.usuarioLogadoService.limparSessao();

    this.authService
      .login({
        email: emailNormalizado,

        senha,
      })
      .pipe(
        timeout(10000),

        switchMap((respostaLogin) => {
          if (respostaLogin.primeiroAcesso) {
            this.nomePrimeiroAcesso = respostaLogin.nomeCompleto;

            this.primeiroAcessoPendente = true;

            return EMPTY;
          }

          return this.funcionarioService.buscarMeuPerfil().pipe(timeout(10000));
        }),

        catchError((erro: unknown) => {
          console.error('Erro durante o login:', erro);

          this.usuarioLogadoService.limparSessao();

          this.mensagemErro = this.obterMensagemErro(erro);

          return EMPTY;
        }),

        finalize(() => {
          this.carregando = false;
        }),
      )
      .subscribe((perfil) => {
        this.finalizarLogin(perfil);
      });
  }

  concluirPrimeiroAcesso(event: Event, novaSenha: string, confirmacaoSenha: string): void {
    event.preventDefault();

    if (this.alterandoSenhaPrimeiroAcesso) {
      return;
    }

    this.mensagemErroPrimeiroAcesso = '';

    if (!novaSenha || !confirmacaoSenha) {
      this.mensagemErroPrimeiroAcesso = 'Preencha a nova senha e a confirmação.';

      return;
    }

    if (novaSenha.length < 8) {
      this.mensagemErroPrimeiroAcesso = 'A nova senha deve possuir pelo menos 8 caracteres.';

      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      this.mensagemErroPrimeiroAcesso = 'As senhas informadas não são iguais.';

      return;
    }

    this.alterandoSenhaPrimeiroAcesso = true;

    this.authService
      .concluirPrimeiroAcesso({
        novaSenha,
        confirmacaoSenha,
      })
      .pipe(
        timeout(10000),

        switchMap(() => this.funcionarioService.buscarMeuPerfil().pipe(timeout(10000))),

        catchError((erro: unknown) => {
          console.error('Erro ao concluir primeiro acesso:', erro);

          this.mensagemErroPrimeiroAcesso = this.obterMensagemErro(erro);

          return EMPTY;
        }),

        finalize(() => {
          this.alterandoSenhaPrimeiroAcesso = false;
        }),
      )
      .subscribe((perfil) => {
        this.primeiroAcessoPendente = false;

        this.finalizarLogin(perfil);
      });
  }

  private finalizarLogin(perfil: FuncionarioResponse): void {
    this.usuarioLogadoService.definirUsuarioLogado({
      id: perfil.id,

      nome: perfil.nomeCompleto,

      email: perfil.emailCorporativo,

      matricula: perfil.matricula,

      cargo: perfil.cargo,

      setor: perfil.setor,

      iniciais: this.gerarIniciais(perfil.nomeCompleto),

      tipo: perfil.tipoAcesso,
    });

    void this.router.navigateByUrl(this.usuarioLogadoService.obterRotaInicial());
  }

  private obterMensagemErro(erro: unknown): string {
    if (erro instanceof TimeoutError) {
      return 'O servidor demorou muito para responder.';
    }

    if (!(erro instanceof HttpErrorResponse)) {
      return 'Não foi possível realizar a operação.';
    }

    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    if (erro.status === 401) {
      return 'E-mail ou senha inválidos.';
    }

    if (erro.status === 403) {
      if (typeof erro.error?.mensagem === 'string') {
        return erro.error.mensagem;
      }

      return 'Este usuário não possui acesso ao sistema.';
    }

    if (typeof erro.error?.mensagem === 'string') {
      return erro.error.mensagem;
    }

    return 'Não foi possível realizar a operação.';
  }

  private gerarIniciais(nome: string): string {
    return nome
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte: string): string => parte.charAt(0).toUpperCase())
      .join('');
  }

  private aplicarTema(tema: Tema): void {
    this.temaAtual = tema;

    this.document.documentElement.setAttribute('data-bs-theme', tema);

    localStorage.setItem('tema', tema);
  }
}
