import {
  CommonModule,
  DOCUMENT,
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  Router,
  RouterOutlet,
} from '@angular/router';

import { UsuarioLogadoService } from './core/services/usuario-logado.service';

import { FooterComponent } from './shared/footer-component/footer-component';
import { HeaderComponent } from './shared/header-component/header-component';
import { SidebarAdmin } from './shared/sidebar-admin/sidebar-admin';
import { Sidebar } from './shared/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar,
    SidebarAdmin,
    CommonModule,
    FooterComponent,
    HeaderComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title =
    signal(
      'sistema-gestao-absenteismo'
    );

  constructor(
    public readonly router: Router,

    private readonly usuarioLogadoService:
      UsuarioLogadoService,

    @Inject(DOCUMENT)
    private readonly document: Document
  ) {}

  ngOnInit(): void {
    const temaSalvo =
      localStorage.getItem('tema');

    this.document
      .documentElement
      .setAttribute(
        'data-bs-theme',
        temaSalvo === 'dark'
          ? 'dark'
          : 'light'
      );
  }

  mostrarSidebar(): boolean {
    const rotaAtual =
      this.router.url.split('?')[0];

    return (
      rotaAtual !== '/login' &&
      rotaAtual !== '/alterar-senha'
    );
  }

  mostrarSidebarFuncionario(): boolean {
    return (
      this.mostrarSidebar() &&
      this.usuarioLogadoService
        .ehFuncionario()
    );
  }

  mostrarSidebarGestaoOuRh(): boolean {
    return (
      this.mostrarSidebar() &&
      this.usuarioLogadoService
        .ehGestorOuRh()
    );
  }
}