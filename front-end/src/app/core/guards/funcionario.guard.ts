import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';

import { UsuarioLogadoService } from '../services/usuario-logado.service';

export const funcionarioGuard: CanActivateFn = () => {
  const router = inject(Router);

  const usuarioLogadoService =
    inject(UsuarioLogadoService);

  if (
    usuarioLogadoService.ehFuncionario()
  ) {
    return true;
  }

  if (
    usuarioLogadoService.ehGestorOuRh()
  ) {
    return router.createUrlTree(
      ['/gestao/inicio']
    );
  }

  return router.createUrlTree(['/login']);
};