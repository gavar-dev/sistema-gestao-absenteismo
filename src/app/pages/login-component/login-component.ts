import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  senhaVisivel = false;

  constructor(private router: Router) {}

  alternarVisibilidade(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  entrar(event: Event): void {
    event.preventDefault();

    // Por enquanto, esse login apenas simula a entrada no sistema.
    // Quando criar autenticação real, a validação entra aqui.
    this.router.navigate(['/']);
  }
}
