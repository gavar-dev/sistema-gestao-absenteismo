import { Component, DOCUMENT, Inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './shared/footer-component/footer-component';
import { HeaderComponent } from './shared/header-component/header-component';
import { UsuarioLogadoService } from './core/services/usuario-logado.service';
import { filter } from 'rxjs';
import { SidebarAdmin } from './shared/sidebar-admin/sidebar-admin';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, SidebarAdmin, CommonModule, FooterComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('sistema-gestao-absenteismo');

  constructor(
    public router: Router,
    private usuarioLogadoService: UsuarioLogadoService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('tema');
    this.document.documentElement.setAttribute('data-bs-theme', temaSalvo === 'dark' ? 'dark' : 'light');

    this.redirecionarPeloPerfil(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.redirecionarPeloPerfil(event.urlAfterRedirects);
      });
  }

  mostrarSidebar(): boolean {
    return !this.router.url.startsWith('/login');
  }

  mostrarSidebarFuncionario(): boolean {
    return this.mostrarSidebar() && this.usuarioLogadoService.ehFuncionario();
  }

  mostrarSidebarGestaoOuRh(): boolean {
    return this.mostrarSidebar() && this.usuarioLogadoService.ehGestorOuRh();
  }

  private redirecionarPeloPerfil(url: string): void {
    if (url.startsWith('/login')) {
      return;
    }

    if (this.usuarioLogadoService.ehGestorOuRh() && !url.startsWith('/gestao')) {
      this.router.navigate(['/gestao/inicio']);
      return;
    }

    if (this.usuarioLogadoService.ehFuncionario() && url.startsWith('/gestao')) {
      this.router.navigate(['/']);
    }
  }
}
