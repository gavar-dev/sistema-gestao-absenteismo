import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UsuarioLogado } from '../../models/usuarioLogado';
import { TipoUsuario } from '../../models/tipoUsuario';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioLogadoService {
  private readonly chaveUsuarioLogado = 'usuarioLogado';

  constructor(private readonly router: Router, private readonly tokenStorage: TokenStorageService) {}

  definirUsuarioLogado(usuario: UsuarioLogado): void {
    localStorage.setItem(this.chaveUsuarioLogado, JSON.stringify(usuario));
  }

  obterUsuarioLogado(): UsuarioLogado | null {

    const usuarioSalvo = localStorage.getItem(this.chaveUsuarioLogado);

    if (!usuarioSalvo) {
      return null;
    }

    try {

      return JSON.parse(usuarioSalvo) as UsuarioLogado;

    } catch {

      this.limparSessao();

      return null;
    }
  }

  obterTipoUsuario(): TipoUsuario | null {
    return this.obterUsuarioLogado()?.tipo ?? null;
  }

  obterRotaInicial(): string {
    return this.ehGestorOuRh() ? '/gestao/inicio' : '/';
  }

  ehFuncionario(): boolean {
    return this.obterTipoUsuario() === 'funcionario';
  }

  ehGestorOuRh(): boolean {
    const tipo = this.obterTipoUsuario();

    return tipo === 'gestor' || tipo === 'rh';
  }

  limparSessao(): void {
    /*
    * Remove também a chave usada
    * anteriormente pelo login mockado.
    */
    localStorage.removeItem('tipoUsuario');

    localStorage.removeItem(this.chaveUsuarioLogado);

    this.tokenStorage.limpar();
  }

  logout(): void {
    this.limparSessao();
    // this.router.navigate(['/login']);
    this.router.navigateByUrl('/login');
  }
}