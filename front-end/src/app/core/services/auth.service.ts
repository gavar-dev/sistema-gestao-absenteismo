import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  AlterarSenhaRequest,
  LoginRequest,
  LoginResponse,
  PrimeiroAcessoRequest,
  RecuperarSenhaRequest,
} from '../../models/auth';

import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url = `${environment.apiUrl}/auth`;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
  ) {}

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, dados).pipe(
      tap((response: LoginResponse): void => {
        this.tokenStorage.salvarToken(response.token, response.expiraEm);
      }),
    );
  }

  alterarSenha(dados: AlterarSenhaRequest): Observable<void> {
    return this.http.patch<void>(`${this.url}/alterar-senha`, dados);
  }

  recuperarSenha(dados: RecuperarSenhaRequest): Observable<void> {
    return this.http.patch<void>(`${this.url}/recuperar-senha`, dados);
  }

  obterToken(): string | null {
    return this.tokenStorage.obterToken();
  }

  estaAutenticado(): boolean {
    return this.tokenStorage.possuiTokenValido();
  }

  logout(): void {
    this.tokenStorage.limpar();
  }

  concluirPrimeiroAcesso(dados: PrimeiroAcessoRequest): Observable<LoginResponse> {
    return this.http.patch<LoginResponse>(`${this.url}/primeiro-acesso`, dados).pipe(
      tap((response: LoginResponse): void => {
        this.tokenStorage.salvarToken(response.token, response.expiraEm);
      }),
    );
  }
}
