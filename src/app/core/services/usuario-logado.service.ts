import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type TipoUsuario = 'funcionario' | 'gestor' | 'rh';

@Injectable({
  providedIn: 'root',
})
export class UsuarioLogadoService {
  private readonly chaveTipoUsuario = 'tipoUsuario';

  constructor(private router: Router) {}

  definirTipoUsuario(tipo: TipoUsuario): void {
    localStorage.setItem(this.chaveTipoUsuario, tipo);
  }

  obterTipoUsuario(): TipoUsuario {
    return (localStorage.getItem(this.chaveTipoUsuario) as TipoUsuario) || 'funcionario';
  }

  ehFuncionario(): boolean {
    return this.obterTipoUsuario() === 'funcionario';
  }

  ehGestorOuRh(): boolean {
    const tipo = this.obterTipoUsuario();
    return tipo === 'gestor' || tipo === 'rh';
  }

  logout(): void {
    localStorage.removeItem(this.chaveTipoUsuario);
    this.router.navigate(['/login']);
  }
}