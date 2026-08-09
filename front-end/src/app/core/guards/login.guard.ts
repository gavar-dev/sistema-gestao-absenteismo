import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';

import { UsuarioLogadoService } from '../services/usuario-logado.service';

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);

  const tokenStorage = inject(TokenStorageService);

  const usuarioLogadoService = inject(UsuarioLogadoService);

  const tokenValido = tokenStorage.possuiTokenValido();

  /*
   * Existe um JWT válido de primeiro acesso.
   *
   * Mantemos o usuário na tela de login,
   * pois é nela que o modal obrigatório
   * de alteração da senha será exibido.
   *
   * Não limpamos o JWT.
   */
  if (tokenValido && tokenStorage.ehPrimeiroAcessoPendente()) {
    return true;
  }

  const usuario = usuarioLogadoService.obterUsuarioLogado();

  /*
   * Não há token válido.
   * A tela de login pode ser acessada.
   */
  if (!tokenValido) {
    usuarioLogadoService.limparSessao();

    return true;
  }

  /*
   * Existe token válido e usuário
   * completamente autenticado.
   *
   * Não faz sentido voltar ao login.
   */
  if (usuario) {
    return router.createUrlTree([usuarioLogadoService.obterRotaInicial()]);
  }

  /*
   * Estado inconsistente:
   * token válido, mas nenhum usuário
   * e também não é primeiro acesso.
   */
  usuarioLogadoService.limparSessao();

  return true;
};
