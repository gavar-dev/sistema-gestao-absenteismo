import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface IndicadorGestao {
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
  variacao: string;
  tipo: 'positivo' | 'atencao' | 'neutro' | 'perigo';
}

interface StatusFuncionario {
  nome: string;
  quantidade: number;
  percentual: number;
  classe: string;
}

interface IndicadorSetor {
  nome: string;
  funcionarios: number;
  atrasos: number;
  faltas: number;
  percentual: number;
}

interface FuncionarioCritico {
  nome: string;
  setor: string;
  atrasos: number;
  faltas: number;
  status: string;
}

interface SolicitacaoRecente {
  funcionario: string;
  tipo: string;
  data: string;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
}

interface AlertaGestao {
  titulo: string;
  descricao: string;
  icone: string;
  tipo: 'warning' | 'danger' | 'info';
}

interface ResumoHoje {
  label: string;
  valor: number;
  total: number;
}

@Component({
  selector: 'app-inicio-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio-component.html',
  styleUrl: './inicio-component.css',
})
export class InicioComponent {
  indicadores: IndicadorGestao[] = [
    {
      titulo: 'Funcionários cadastrados',
      valor: '128',
      descricao: '112 ativos no momento',
      icone: 'bi-people-fill',
      variacao: '+4 este mês',
      tipo: 'positivo',
    },
    {
      titulo: 'Presentes hoje',
      valor: '104',
      descricao: '81% da base ativa',
      icone: 'bi-person-check-fill',
      variacao: '+7 vs. ontem',
      tipo: 'positivo',
    },
    {
      titulo: 'Atrasos no mês',
      valor: '36',
      descricao: 'Maior concentração em Operações',
      icone: 'bi-alarm-fill',
      variacao: '+8 na semana',
      tipo: 'atencao',
    },
    {
      titulo: 'Faltas no mês',
      valor: '14',
      descricao: '6 ainda sem justificativa',
      icone: 'bi-calendar-x-fill',
      variacao: 'Revisar hoje',
      tipo: 'perigo',
    },
  ];

  statusFuncionarios: StatusFuncionario[] = [
    { nome: 'Ativos', quantidade: 112, percentual: 88, classe: 'status-ativos' },
    { nome: 'Férias', quantidade: 8, percentual: 6, classe: 'status-ferias' },
    { nome: 'Afastados', quantidade: 5, percentual: 4, classe: 'status-afastados' },
    { nome: 'Inativos', quantidade: 3, percentual: 2, classe: 'status-inativos' },
  ];

  indicadoresSetor: IndicadorSetor[] = [
    { nome: 'Operações', funcionarios: 34, atrasos: 14, faltas: 5, percentual: 100 },
    { nome: 'Comercial', funcionarios: 27, atrasos: 9, faltas: 3, percentual: 64 },
    { nome: 'Tecnologia', funcionarios: 22, atrasos: 5, faltas: 1, percentual: 36 },
    { nome: 'Financeiro', funcionarios: 18, atrasos: 4, faltas: 2, percentual: 29 },
    { nome: 'RH', funcionarios: 11, atrasos: 2, faltas: 0, percentual: 14 },
  ];

  funcionariosCriticos: FuncionarioCritico[] = [
    { nome: 'João Pereira', setor: 'Operações', atrasos: 5, faltas: 1, status: 'Acompanhar' },
    { nome: 'Bruna Lima', setor: 'Operações', atrasos: 4, faltas: 2, status: 'Crítico' },
    { nome: 'Rafael Costa', setor: 'Comercial', atrasos: 4, faltas: 0, status: 'Acompanhar' },
    { nome: 'Larissa Nunes', setor: 'Financeiro', atrasos: 2, faltas: 2, status: 'Crítico' },
  ];

  solicitacoesRecentes: SolicitacaoRecente[] = [
    { funcionario: 'Maria Silva', tipo: 'Correção de ponto', data: 'Hoje, 09:42', status: 'Pendente' },
    { funcionario: 'Pedro Santos', tipo: 'Justificativa de falta', data: 'Ontem, 16:10', status: 'Pendente' },
    { funcionario: 'Camila Rocha', tipo: 'Solicitação de férias', data: '01/07/2026', status: 'Aprovada' },
    { funcionario: 'João Pereira', tipo: 'Correção cadastral', data: '30/06/2026', status: 'Rejeitada' },
  ];

  alertas: AlertaGestao[] = [
    {
      titulo: 'Pendências de ponto',
      descricao: '6 funcionários estão com ponto incompleto nos últimos 7 dias.',
      icone: 'bi-exclamation-triangle-fill',
      tipo: 'warning',
    },
    {
      titulo: 'Absenteísmo acima do ideal',
      descricao: 'Operações concentra 40% das faltas registradas no mês.',
      icone: 'bi-graph-up-arrow',
      tipo: 'danger',
    },
    {
      titulo: 'Férias próximas',
      descricao: '8 colaboradores entram em férias nos próximos 30 dias.',
      icone: 'bi-calendar2-check-fill',
      tipo: 'info',
    },
  ];

  resumoHoje: ResumoHoje[] = [
    { label: 'Dentro do horário', valor: 92, total: 104 },
    { label: 'Com atraso', valor: 9, total: 104 },
    { label: 'Ponto incompleto', valor: 3, total: 104 },
  ];

  porcentagem(valor: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Math.round((valor / total) * 100);
  }

  totalStatusFuncionarios(): number {
    return this.statusFuncionarios.reduce((total, status) => total + status.quantidade, 0);
  }

  resumoDetalhe(item: ResumoHoje): string {
    return `${item.label}: ${item.valor} de ${item.total} registros, ${this.porcentagem(item.valor, item.total)}% do resumo de hoje.`;
  }

  statusDetalhe(status: StatusFuncionario): string {
    return `${status.nome}: ${status.quantidade} funcionários, ${status.percentual}% do total cadastrado.`;
  }

  setorDetalhe(setor: IndicadorSetor): string {
    return `${setor.nome}: ${setor.funcionarios} funcionários, ${setor.atrasos} atrasos e ${setor.faltas} faltas no mês.`;
  }

  statusClasseSolicitacao(status: SolicitacaoRecente['status']): string {
    const classes: Record<SolicitacaoRecente['status'], string> = {
      Pendente: 'text-bg-warning',
      Aprovada: 'text-bg-success',
      Rejeitada: 'text-bg-danger',
    };

    return classes[status];
  }

  statusClasseFuncionario(status: string): string {
    return status === 'Crítico' ? 'text-bg-danger' : 'text-bg-warning';
  }

  alertaClasse(tipo: AlertaGestao['tipo']): string {
    const classes: Record<AlertaGestao['tipo'], string> = {
      warning: 'alerta-warning',
      danger: 'alerta-danger',
      info: 'alerta-info',
    };

    return classes[tipo];
  }
}
