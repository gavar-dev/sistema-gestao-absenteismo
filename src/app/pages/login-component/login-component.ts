import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(
    private router: Router,
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

  entrar(event: Event): void {
    event.preventDefault();

    // Por enquanto, esse login apenas simula a entrada no sistema.
    // Quando criar autenticação real, a validação entra aqui.
    this.router.navigate(['/']);
  }

  private aplicarTema(tema: Tema): void {
    this.temaAtual = tema;
    this.document.documentElement.setAttribute('data-bs-theme', tema);
    localStorage.setItem('tema', tema);
  }
}
