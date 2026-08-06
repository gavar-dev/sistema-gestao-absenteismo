import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { funcionarioGuard } from './core/guards/funcionario.guard';
import { gestaoGuard } from './core/guards/gestao.guard';
import { loginGuard } from './core/guards/login.guard';

import { LoginComponent } from './pages/login-component/login-component';

import { AvisoComponente } from './pages/funcionario/aviso-componente/aviso-componente';
import { HistoricoComponente } from './pages/funcionario/historico-componente/historico-componente';
import { InicioComponente } from './pages/funcionario/inicio-componente/inicio-componente';
import { MeuPontoComponente } from './pages/funcionario/meu-ponto-componente/meu-ponto-componente';
import { MeusDadosComponente } from './pages/funcionario/meus-dados-componente/meus-dados-componente';
import { SolicitacaoComponente } from './pages/funcionario/solicitacao-componente/solicitacao-componente';

import { AvisosGestaoComponent } from './pages/admin-rh/avisos-gestao-component/avisos-gestao-component';
import { CadastroFuncionarioComponent } from './pages/admin-rh/cadastro-funcionario-component/cadastro-funcionario-component';
import { GestaoComponent } from './pages/admin-rh/gestao-component/gestao-component';
import { InicioComponent as AdminInicioComponent } from './pages/admin-rh/inicio-component/inicio-component';
import { SolicitacoesComponent } from './pages/admin-rh/solicitacoes-component/solicitacoes-component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },

  // Área do funcionário
  {
    path: '',
    component: InicioComponente,
    canActivate: [
      authGuard,
      funcionarioGuard,
    ],
  },
  {
    path: 'meus-pontos',
    component: MeuPontoComponente,
    canActivate: [
      authGuard,
      funcionarioGuard,
    ],
  },
  {
    path: 'solicitacao',
    component: SolicitacaoComponente,
    canActivate: [
      authGuard,
      funcionarioGuard,
    ],
  },
  {
    path: 'historico',
    component: HistoricoComponente,
    canActivate: [
      authGuard,
      funcionarioGuard,
    ],
  },
  {
    path: 'meus-dados',
    component: MeusDadosComponente,
    canActivate: [
      authGuard,
      funcionarioGuard,
    ],
  },
  {
    path: 'avisos',
    component: AvisoComponente,
    canActivate: [
      authGuard,
      funcionarioGuard,
    ],
  },

  // Área de Gestão/RH
  {
    path: 'gestao',
    canActivate: [
      authGuard,
      gestaoGuard,
    ],
    canActivateChild: [
      authGuard,
      gestaoGuard,
    ],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        component: AdminInicioComponent,
      },
      {
        path: 'funcionarios',
        component: GestaoComponent,
      },
      {
        path: 'solicitacoes',
        component: SolicitacoesComponent,
      },
      {
        path: 'avisos',
        component: AvisosGestaoComponent,
      },
      {
        path: 'cadastro',
        component: CadastroFuncionarioComponent,
      },
      {
        path: 'meu-ponto',
        component: MeuPontoComponente,
        data: {
          area: 'gestao',
        },
      },
      {
        path: 'meus-dados',
        component: MeusDadosComponente,
        data: {
          area: 'gestao',
        },
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];