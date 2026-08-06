import {HttpInterceptorFn} from '@angular/common/http';

import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../services/token-storage.service';

export const jwtInterceptor: HttpInterceptorFn = (request,next) => {
  const tokenStorage = inject(TokenStorageService);

  const token = tokenStorage.obterToken();

  const requisicaoParaApi = request.url.startsWith(environment.apiUrl);

  const requisicaoDeLogin = request.url === `${environment.apiUrl}/auth/login`;

  /*
   * Não enviamos o token:
   * - quando ele ainda não existe;
   * - para servidores externos;
   * - no próprio login.
   */
  if (!token || !requisicaoParaApi || requisicaoDeLogin) {
    return next(request);
  }

  const requestComToken = request.clone({setHeaders: {Authorization: `Bearer ${token}`},});

  return next(requestComToken);
  
};