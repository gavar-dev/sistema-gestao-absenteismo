import { Routes } from '@angular/router';
import { AvisoComponente } from './pages/funcionario/aviso-componente/aviso-componente';
import { MeuPontoComponente } from './pages/funcionario/meu-ponto-componente/meu-ponto-componente';
import { SolicitacaoComponente } from './pages/funcionario/solicitacao-componente/solicitacao-componente';
import { InicioComponente } from './pages/funcionario/inicio-componente/inicio-componente';
import { MeusDadosComponente } from './pages/funcionario/meus-dados-componente/meus-dados-componente';
import { HistoricoComponente } from './pages/funcionario/historico-componente/historico-componente';

export const routes: Routes = [
     { path: '', component: InicioComponente},
     { path: 'solicitacao', component: SolicitacaoComponente},
     { path: 'historico', component: HistoricoComponente},
     { path: 'meus-dados', component: MeusDadosComponente},
     { path: 'meus-pontos', component: MeuPontoComponente},
     { path: 'avisos', component: AvisoComponente}
];
