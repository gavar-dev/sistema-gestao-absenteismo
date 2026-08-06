import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { UsuarioLogadoService } from '../services/usuario-logado.service';

export const gestaoGuard: CanActivateFn = () => {
  const router = inject(Router);

  const usuarioLogadoService =
    inject(UsuarioLogadoService);

  if (
    usuarioLogadoService.ehGestorOuRh()
  ) {
    return true;
  }

  if (
    usuarioLogadoService.ehFuncionario()
  ) {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/login']);
};