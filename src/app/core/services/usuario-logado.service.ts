import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type TipoUsuario = 'funcionario' | 'gestor' | 'rh';

export interface UsuarioLogado {
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  iniciais: string;
  tipo: TipoUsuario;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioLogadoService {
  private readonly chaveTipoUsuario = 'tipoUsuario';
  private readonly chaveUsuarioLogado = 'usuarioLogado';

  constructor(private router: Router) {}

  definirTipoUsuario(tipo: TipoUsuario): void {
    const usuarioAtual = this.obterUsuarioLogado();

    this.definirUsuarioLogado({
      ...(usuarioAtual ?? this.criarUsuarioMock(tipo)),
      tipo,
    });
  }

  definirUsuarioLogado(usuario: UsuarioLogado): void {
    localStorage.setItem(this.chaveTipoUsuario, usuario.tipo);
    localStorage.setItem(this.chaveUsuarioLogado, JSON.stringify(usuario));
  }

  obterUsuarioLogado(): UsuarioLogado | null {
    const usuarioSalvo = localStorage.getItem(this.chaveUsuarioLogado);

    if (usuarioSalvo) {
      return JSON.parse(usuarioSalvo) as UsuarioLogado;
    }

    const tipoSalvo = localStorage.getItem(this.chaveTipoUsuario) as TipoUsuario | null;

    if (tipoSalvo) {
      return this.criarUsuarioMock(tipoSalvo);
    }

    return null;
  }

  obterTipoUsuario(): TipoUsuario {
    return this.obterUsuarioLogado()?.tipo ?? 'funcionario';
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

  logout(): void {
    localStorage.removeItem(this.chaveTipoUsuario);
    localStorage.removeItem(this.chaveUsuarioLogado);
    this.router.navigate(['/login']);
  }

  private criarUsuarioMock(tipo: TipoUsuario): UsuarioLogado {
    if (tipo === 'rh') {
      return {
        nome: 'Renata Souza',
        email: 'rh.corporativo@gmail.com',
        cargo: 'Analista de RH',
        setor: 'Recursos Humanos',
        iniciais: 'RS',
        tipo: 'rh',
      };
    }

    if (tipo === 'gestor') {
      return {
        nome: 'Carla Mendes',
        email: 'fed.silva.corporativo@gmail.com',
        cargo: 'Gestora de RH',
        setor: 'Gestão de Pessoas',
        iniciais: 'CM',
        tipo: 'gestor',
      };
    }

    return {
      nome: 'Maria Silva',
      email: 'funcionario@gmail.com',
      cargo: 'Analista de Vendas',
      setor: 'Comercial',
      iniciais: 'MS',
      tipo: 'funcionario',
    };
  }
}
