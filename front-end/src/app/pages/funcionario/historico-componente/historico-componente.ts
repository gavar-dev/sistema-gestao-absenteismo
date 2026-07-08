import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ResumoHistorico {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo: 'positivo' | 'atencao' | 'neutro' | 'perigo';
}

interface RegistroHistorico {
  data: string;
  diaSemana: string;
  entrada: string;
  almoco: string;
  retorno: string;
  saida: string;
  horas: string;
  status: 'Completo' | 'Incompleto' | 'Atraso' | 'Falta justificada' | 'Falta';
  observacao: string;
}

interface GraficoSemana {
  semana: string;
  horas: number;
  atrasos: number;
  faltas: number;
}

interface SolicitacaoHistorico {
  tipo: string;
  referencia: string;
  enviadaEm: string;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
}

@Component({
  selector: 'app-historico-componente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './historico-componente.html',
  styleUrl: './historico-componente.css',
})
export class HistoricoComponente {
  filtroMes = '2026-07';
  filtroStatus = 'Todos';
  filtroBusca = '';

  resumo: ResumoHistorico[] = [
    {
      titulo: 'Dias trabalhados',
      valor: '16',
      detalhe: 'No mês selecionado',
      icone: 'bi-calendar-check',
      tipo: 'positivo',
    },
    {
      titulo: 'Horas registradas',
      valor: '126h40',
      detalhe: 'Meta mensal: 176h',
      icone: 'bi-clock-history',
      tipo: 'neutro',
    },
    {
      titulo: 'Atrasos',
      valor: '2',
      detalhe: 'Dentro da média permitida',
      icone: 'bi-alarm',
      tipo: 'atencao',
    },
    {
      titulo: 'Faltas',
      valor: '1',
      detalhe: 'Com justificativa enviada',
      icone: 'bi-calendar-x',
      tipo: 'perigo',
    },
  ];

  registros: RegistroHistorico[] = [
    {
      data: '08/07/2026',
      diaSemana: 'Quarta-feira',
      entrada: '08:03',
      almoco: '12:05',
      retorno: '13:00',
      saida: '17:04',
      horas: '08h01',
      status: 'Completo',
      observacao: 'Jornada normal',
    },
    {
      data: '07/07/2026',
      diaSemana: 'Terça-feira',
      entrada: '08:41',
      almoco: '12:10',
      retorno: '13:08',
      saida: '17:30',
      horas: '07h51',
      status: 'Atraso',
      observacao: 'Entrada acima da tolerância',
    },
    {
      data: '06/07/2026',
      diaSemana: 'Segunda-feira',
      entrada: '08:00',
      almoco: '12:00',
      retorno: '13:00',
      saida: '17:00',
      horas: '08h00',
      status: 'Completo',
      observacao: 'Jornada normal',
    },
    {
      data: '03/07/2026',
      diaSemana: 'Sexta-feira',
      entrada: '08:05',
      almoco: '12:03',
      retorno: '--:--',
      saida: '17:02',
      horas: '07h59',
      status: 'Incompleto',
      observacao: 'Retorno do almoço não registrado',
    },
    {
      data: '02/07/2026',
      diaSemana: 'Quinta-feira',
      entrada: '--:--',
      almoco: '--:--',
      retorno: '--:--',
      saida: '--:--',
      horas: '00h00',
      status: 'Falta justificada',
      observacao: 'Atestado enviado para análise',
    },
    {
      data: '01/07/2026',
      diaSemana: 'Quarta-feira',
      entrada: '08:08',
      almoco: '12:04',
      retorno: '13:02',
      saida: '17:06',
      horas: '07h58',
      status: 'Completo',
      observacao: 'Jornada normal',
    },
  ];

  graficoSemanas: GraficoSemana[] = [
    { semana: 'Sem 1', horas: 32, atrasos: 1, faltas: 1 },
    { semana: 'Sem 2', horas: 38, atrasos: 0, faltas: 0 },
    { semana: 'Sem 3', horas: 40, atrasos: 1, faltas: 0 },
    { semana: 'Sem 4', horas: 16.7, atrasos: 0, faltas: 0 },
  ];

  solicitacoes: SolicitacaoHistorico[] = [
    {
      tipo: 'Correção de ponto',
      referencia: '03/07/2026',
      enviadaEm: '04/07/2026',
      status: 'Pendente',
    },
    {
      tipo: 'Justificativa de falta',
      referencia: '02/07/2026',
      enviadaEm: '02/07/2026',
      status: 'Aprovada',
    },
    {
      tipo: 'Correção de entrada',
      referencia: '25/06/2026',
      enviadaEm: '26/06/2026',
      status: 'Rejeitada',
    },
  ];

  statusDisponiveis = ['Todos', 'Completo', 'Incompleto', 'Atraso', 'Falta justificada', 'Falta'];

  get registrosFiltrados(): RegistroHistorico[] {
    const busca = this.filtroBusca.trim().toLowerCase();

    return this.registros.filter((registro) => {
      const statusConfere = this.filtroStatus === 'Todos' || registro.status === this.filtroStatus;
      const buscaConfere =
        !busca ||
        registro.data.toLowerCase().includes(busca) ||
        registro.diaSemana.toLowerCase().includes(busca) ||
        registro.observacao.toLowerCase().includes(busca) ||
        registro.status.toLowerCase().includes(busca);

      return statusConfere && buscaConfere;
    });
  }

  percentualHoras(horas: number): number {
    return Math.min(Math.round((horas / 40) * 100), 100);
  }

  detalheSemana(item: GraficoSemana): string {
    return `${item.semana}: ${this.horasSemanaFormatadas(item.horas)} registradas, ${item.atrasos} atraso(s) e ${item.faltas} falta(s).`;
  }

  horasSemanaFormatadas(horas: number): string {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);

    return `${horasInteiras}h${minutos.toString().padStart(2, '0')}`;
  }

  limparFiltros(): void {
    this.filtroStatus = 'Todos';
    this.filtroBusca = '';
  }

  classeStatus(status: RegistroHistorico['status']): string {
    const classes: Record<RegistroHistorico['status'], string> = {
      Completo: 'text-bg-success',
      Incompleto: 'text-bg-warning',
      Atraso: 'text-bg-warning',
      'Falta justificada': 'text-bg-info',
      Falta: 'text-bg-danger',
    };

    return classes[status];
  }

  classeSolicitacao(status: SolicitacaoHistorico['status']): string {
    const classes: Record<SolicitacaoHistorico['status'], string> = {
      Pendente: 'text-bg-warning',
      Aprovada: 'text-bg-success',
      Rejeitada: 'text-bg-danger',
    };

    return classes[status];
  }
}
