import {
  CommonModule,
  DOCUMENT,
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { UsuarioLogadoService } from '../../core/services/usuario-logado.service';

import {
  FuncionarioAvatarComponent
} from '../funcionario-avatar/funcionario-avatar';

type Tema =
  | 'light'
  | 'dark';

interface ItemMenuGestao {
  nome: string;
  rota: string;
  icone: string;
  exata: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FuncionarioAvatarComponent,
  ],
  templateUrl:
    './sidebar-admin.html',
  styleUrl:
    './sidebar-admin.css',
})
export class SidebarAdmin
  implements OnInit {

  temaAtual: Tema = 'light';

  usuario = {
  id: 0,
  nome: 'Carla Mendes',
  cargo: 'Gestora de RH',
  setor: 'Recursos Humanos',
  iniciais: 'CM',
};

  readonly menu:
    ItemMenuGestao[] = [
      {
        nome: 'Painel inicial',
        rota: '/gestao/inicio',
        icone: 'bi-speedometer2',
        exata: true,
      },
      {
        nome: 'Meu ponto',
        rota: '/gestao/meu-ponto',
        icone: 'bi-fingerprint',
        exata: true,
      },
      {
        nome: 'Meus dados',
        rota: '/gestao/meus-dados',
        icone: 'bi-person-vcard-fill',
        exata: true,
      },
      {
        nome: 'Gestão',
        rota: '/gestao/funcionarios',
        icone: 'bi-people-fill',
        exata: false,
      },
      {
        nome: 'Solicitações',
        rota: '/gestao/solicitacoes',
        icone: 'bi-inbox-fill',
        exata: false,
      },
      {
        nome: 'Avisos',
        rota: '/gestao/avisos',
        icone: 'bi-megaphone-fill',
        exata: false,
      },
      {
        nome: 'Cadastro',
        rota: '/gestao/cadastro',
        icone: 'bi-person-plus-fill',
        exata: false,
      },
    ];

  constructor(
    @Inject(DOCUMENT)
    private readonly document:
      Document,

    private readonly usuarioLogadoService:
      UsuarioLogadoService
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

    this.atualizarUsuarioPeloPerfil();
  }

  alternarTema(): void {
    const proximoTema: Tema =
      this.temaAtual === 'dark'
        ? 'light'
        : 'dark';

    this.aplicarTema(proximoTema);
  }

  sair(): void {
    this.usuarioLogadoService.logout();
  }

  private aplicarTema(
    tema: Tema
  ): void {
    this.temaAtual = tema;

    this.document.documentElement
      .setAttribute(
        'data-bs-theme',
        tema
      );

    localStorage.setItem(
      'tema',
      tema
    );
  }

  private atualizarUsuarioPeloPerfil():
    void {

    const usuarioLogado =
      this.usuarioLogadoService
        .obterUsuarioLogado();

    if (!usuarioLogado) {
      return;
    }

    this.usuario = {
      id: usuarioLogado.id,
      nome: usuarioLogado.nome,
      cargo: usuarioLogado.cargo,
      setor: usuarioLogado.setor,
      iniciais: usuarioLogado.iniciais,
    };
  }
}