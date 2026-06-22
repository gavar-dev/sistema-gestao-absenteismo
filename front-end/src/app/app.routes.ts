import { Routes } from '@angular/router';
import { AvisoComponente } from './pages/funcionario/aviso-componente/aviso-componente';
import { MeuPontoComponente } from './pages/funcionario/meu-ponto-componente/meu-ponto-componente';
import { SolicitacaoComponente } from './pages/funcionario/solicitacao-componente/solicitacao-componente';
import { InicioComponente } from './pages/funcionario/inicio-componente/inicio-componente';
import { MeusDadosComponente } from './pages/funcionario/meus-dados-componente/meus-dados-componente';
import { HistoricoComponente } from './pages/funcionario/historico-componente/historico-componente';
import { LoginComponent } from './pages/login-component/login-component';

import { InicioComponent as AdminInicioComponent } from './pages/admin-rh/inicio-component/inicio-component';
import { GestaoComponent } from './pages/admin-rh/gestao-component/gestao-component';
import { SolicitacoesComponent } from './pages/admin-rh/solicitacoes-component/solicitacoes-component';
import { CadastroFuncionarioComponent } from './pages/admin-rh/cadastro-funcionario-component/cadastro-funcionario-component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Área do funcionário
  { path: '', component: InicioComponente },
  { path: 'meus-pontos', component: MeuPontoComponente },
  { path: 'solicitacao', component: SolicitacaoComponente },
  { path: 'historico', component: HistoricoComponente },
  { path: 'meus-dados', component: MeusDadosComponente },
  { path: 'avisos', component: AvisoComponente },

  // Área de Gestão/RH
  {
    path: 'gestao',
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: AdminInicioComponent },
      { path: 'funcionarios', component: GestaoComponent },
      { path: 'solicitacoes', component: SolicitacoesComponent },
      { path: 'cadastro', component: CadastroFuncionarioComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];
