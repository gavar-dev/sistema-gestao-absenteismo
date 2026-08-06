import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly chaveToken = 'authToken';
  private readonly chaveExpiracao = 'authTokenExpiraEm';

  salvarToken(token: string, expiraEm: string): void {
    localStorage.setItem(this.chaveToken, token);
    localStorage.setItem(this.chaveExpiracao, expiraEm);
  }

  obterToken(): string | null {
    return localStorage.getItem(this.chaveToken);
  }

  obterExpiracao(): string | null {
    return localStorage.getItem(this.chaveExpiracao);
  }

  possuiTokenValido(): boolean {
    const token = this.obterToken();
    const expiracao = this.obterExpiracao();

    if (!token || !expiracao) {
      return false;
    }

    const dataExpiracao = new Date(expiracao);

    if (Number.isNaN(dataExpiracao.getTime())) {
      this.limpar();
      return false;
    }

    const tokenValido =
      dataExpiracao.getTime() > Date.now();

    if (!tokenValido) {
      this.limpar();
    }

    return tokenValido;
  }

  limpar(): void {
    localStorage.removeItem(this.chaveToken);
    localStorage.removeItem(this.chaveExpiracao);
  }
}