import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TipoUsuario, UsuarioLogadoService } from '../../core/services/usuario-logado.service';

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

  private readonly usuariosMock: Record<string, TipoUsuario> = {
    'fed.silva.corporativo@gmail.com': 'gestor',
    'rh.corporativo@gmail.com': 'rh',
  };

  constructor(
    private router: Router,
    private usuarioLogadoService: UsuarioLogadoService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('tema') as Tema | null;
    this.aplicarTema(temaSalvo === 'dark' ? 'dark' : 'light');
  }

  alternarTema(): void {
    const proximoTema: Tema = this.temaAtual === 'dark' ? 'light' : 'dark';
    this.aplicarTema(proximoTema);
  }

  alternarVisibilidade(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  entrar(event: Event, email: string, _senha: string): void {
    event.preventDefault();

    const tipoUsuario = this.identificarTipoUsuario(email);
    this.usuarioLogadoService.definirTipoUsuario(tipoUsuario);

    this.router.navigateByUrl(this.usuarioLogadoService.obterRotaInicial());
  }

  private identificarTipoUsuario(email: string): TipoUsuario {
    const emailNormalizado = email.trim().toLowerCase();
    return this.usuariosMock[emailNormalizado] ?? 'funcionario';
  }

  private aplicarTema(tema: Tema): void {
    this.temaAtual = tema;
    this.document.documentElement.setAttribute('data-bs-theme', tema);
    localStorage.setItem('tema', tema);
  }
}
