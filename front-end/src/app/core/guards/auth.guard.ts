import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';
import { UsuarioLogadoService } from '../services/usuario-logado.service';

export const authGuard: CanActivateFn = (
  route,
  state
) => {
  const router = inject(Router);

  const tokenStorage =
    inject(TokenStorageService);

  const usuarioLogadoService =
    inject(UsuarioLogadoService);

  const tokenValido =
    tokenStorage.possuiTokenValido();

  const usuario =
    usuarioLogadoService.obterUsuarioLogado();

  if (tokenValido && usuario) {
    return true;
  }

  usuarioLogadoService.limparSessao();

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        retorno: state.url,
      },
    }
  );
};