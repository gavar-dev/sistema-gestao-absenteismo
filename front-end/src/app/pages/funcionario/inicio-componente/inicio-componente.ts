import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CardResumoFuncionario {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo: 'positivo' | 'atencao' | 'neutro' | 'perigo';
}

interface AcaoRapida {
  titulo: string;
  descricao: string;
  icone: string;
  rota: string;
  destaque?: boolean;
}

interface RegistroDia {
  tipo: string;
  horario: string;
  status: 'Registrado' | 'Pendente' | 'Previsto';
  icone: string;
}

interface PendenciaFuncionario {
  titulo: string;
  descricao: string;
  data: string;
  tipo: 'warning' | 'danger' | 'info' | 'success';
  icone: string;
}

interface MetaSemanal {
  dia: string;
  horas: number;
  meta: number;
}

@Component({
  selector: 'app-inicio-componente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio-componente.html',
  styleUrl: './inicio-componente.css',
})
export class InicioComponente {
  nomeFuncionario = 'Maria Silva';
  cargoFuncionario = 'Desenvolvedora Full Stack';
  setorFuncionario = 'Tecnologia';
  statusHoje = 'Jornada em andamento';
  proximaAcao = 'Registrar retorno do almoço';
  horarioProximaAcao = '13:00';

  resumo: CardResumoFuncionario[] = [
    {
      titulo: 'Entrada de hoje',
      valor: '08:03',
      detalhe: 'Dentro da tolerância',
      icone: 'bi-box-arrow-in-right',
      tipo: 'positivo',
    },
    {
      titulo: 'Horas trabalhadas',
      valor: '04h12',
      detalhe: 'Atualizado pelos registros do dia',
      icone: 'bi-hourglass-split',
      tipo: 'neutro',
    },
    {
      titulo: 'Banco de horas',
      valor: '+02h35',
      detalhe: 'Saldo parcial do mês',
      icone: 'bi-graph-up-arrow',
      tipo: 'positivo',
    },
    {
      titulo: 'Pendências',
      valor: '1',
      detalhe: 'Correção aguardando análise',
      icone: 'bi-exclamation-triangle',
      tipo: 'atencao',
    },
  ];

  acoesRapidas: AcaoRapida[] = [
    {
      titulo: 'Bater ponto',
      descricao: 'Registrar entrada, almoço, retorno ou saída.',
      icone: 'bi-fingerprint',
      rota: '/meus-pontos',
      destaque: true,
    },
    {
      titulo: 'Solicitar correção',
      descricao: 'Abrir pedido para ajustar ponto ou justificar ausência.',
      icone: 'bi-pencil-square',
      rota: '/solicitacao',
    },
    {
      titulo: 'Ver histórico',
      descricao: 'Consultar registros anteriores e status do mês.',
      icone: 'bi-clock-history',
      rota: '/historico',
    },
    {
      titulo: 'Meus dados',
      descricao: 'Visualizar dados pessoais e profissionais.',
      icone: 'bi-person-vcard',
      rota: '/meus-dados',
    },
  ];

  registrosHoje: RegistroDia[] = [
    { tipo: 'Entrada', horario: '08:03', status: 'Registrado', icone: 'bi-box-arrow-in-right' },
    { tipo: 'Saída almoço', horario: '12:05', status: 'Registrado', icone: 'bi-cup-hot' },
    { tipo: 'Retorno almoço', horario: '13:00', status: 'Pendente', icone: 'bi-arrow-return-left' },
    { tipo: 'Saída', horario: '17:00', status: 'Previsto', icone: 'bi-box-arrow-right' },
  ];

  pendencias: PendenciaFuncionario[] = [
    {
      titulo: 'Correção de ponto em análise',
      descricao: 'Solicitação enviada para o RH referente ao dia 18/06.',
      data: 'Atualizada hoje, 09:42',
      tipo: 'info',
      icone: 'bi-hourglass-split',
    },
    {
      titulo: 'Volta do almoço pendente',
      descricao: 'Registre o retorno para manter a jornada completa.',
      data: 'Hoje',
      tipo: 'warning',
      icone: 'bi-exclamation-circle',
    },
    {
      titulo: 'Cadastro conferido',
      descricao: 'Seus dados profissionais foram validados recentemente.',
      data: '05/07/2026',
      tipo: 'success',
      icone: 'bi-check-circle',
    },
  ];

  metasSemana: MetaSemanal[] = [
    { dia: 'Seg', horas: 8, meta: 8 },
    { dia: 'Ter', horas: 8.2, meta: 8 },
    { dia: 'Qua', horas: 4.2, meta: 8 },
    { dia: 'Qui', horas: 0, meta: 8 },
    { dia: 'Sex', horas: 0, meta: 8 },
  ];

  porcentagemSemana(item: MetaSemanal): number {
    if (!item.meta) {
      return 0;
    }

    return Math.min(Math.round((item.horas / item.meta) * 100), 100);
  }

  horasFormatadas(horas: number): string {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);

    return `${horasInteiras}h${minutos.toString().padStart(2, '0')}`;
  }

  detalheMeta(item: MetaSemanal): string {
    return `${item.dia}: ${this.horasFormatadas(item.horas)} registradas de ${item.meta}h previstas.`;
  }

  classeStatus(status: RegistroDia['status']): string {
    const classes: Record<RegistroDia['status'], string> = {
      Registrado: 'text-bg-success',
      Pendente: 'text-bg-warning',
      Previsto: 'text-bg-light border text-body',
    };

    return classes[status];
  }

  classeAlerta(tipo: PendenciaFuncionario['tipo']): string {
    const classes: Record<PendenciaFuncionario['tipo'], string> = {
      warning: 'inicio-alerta-warning',
      danger: 'inicio-alerta-danger',
      info: 'inicio-alerta-info',
      success: 'inicio-alerta-success',
    };

    return classes[tipo];
  }
}
