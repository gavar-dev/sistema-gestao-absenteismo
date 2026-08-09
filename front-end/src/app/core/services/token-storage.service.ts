import { Injectable } from '@angular/core';

interface JwtPayload {
  primeiroAcesso?: boolean;
  nome?: string;
  funcionarioId?: number;
  exp?: number;
  [claim: string]: unknown;
}

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

    const tokenValido = dataExpiracao.getTime() > Date.now();

    if (!tokenValido) {
      this.limpar();
    }

    return tokenValido;
  }

  ehPrimeiroAcessoPendente(): boolean {
    if (!this.possuiTokenValido()) {
      return false;
    }

    const payload = this.obterPayload();

    return payload?.primeiroAcesso === true;
  }

  obterNomeUsuarioToken(): string {
    const payload = this.obterPayload();

    const nome = payload?.nome;

    return typeof nome === 'string' ? nome : '';
  }

  obterFuncionarioIdToken(): number | null {
    const payload = this.obterPayload();

    const funcionarioId = payload?.funcionarioId;

    return typeof funcionarioId === 'number' ? funcionarioId : null;
  }

  limpar(): void {
    localStorage.removeItem(this.chaveToken);

    localStorage.removeItem(this.chaveExpiracao);
  }

  private obterPayload(): JwtPayload | null {
    const token = this.obterToken();

    if (!token) {
      return null;
    }

    try {
      const partes = token.split('.');

      if (partes.length !== 3) {
        return null;
      }

      let payloadBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');

      while (payloadBase64.length % 4 !== 0) {
        payloadBase64 += '=';
      }

      const binario = atob(payloadBase64);

      const bytes = Uint8Array.from(binario, (caractere) => caractere.charCodeAt(0));

      const json = new TextDecoder().decode(bytes);

      return JSON.parse(json) as JwtPayload;
    } catch (erro) {
      console.error('Não foi possível ler o payload do JWT:', erro);

      return null;
    }
  }
}
