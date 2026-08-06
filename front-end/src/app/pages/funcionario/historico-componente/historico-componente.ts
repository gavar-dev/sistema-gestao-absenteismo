import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {ChangeDetectorRef,Component,OnInit,} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, timeout } from 'rxjs';

import { PontoService } from '../../../core/services/ponto.service';
import { SolicitacaoService } from '../../../core/services/solicitacao';
import {RegistroPontoResponse,StatusJornada,} from '../../../models/ponto';
import {SolicitacaoResponse,StatusSolicitacao,TipoSolicitacao,} from '../../../models/solicitacao';

type StatusHistorico =
  | 'Completo'
  | 'Incompleto'
  | 'Atraso'
  | 'Falta justificada'
  | 'Falta';

type StatusSolicitacaoVisual =
  | 'Pendente'
  | 'Aprovada'
  | 'Rejeitada';

interface ResumoHistorico {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo: 'positivo' | 'atencao' | 'neutro' | 'perigo';
}

interface RegistroHistorico {
  id: number;
  dataISO: string;
  data: string;
  diaSemana: string;
  entrada: string;
  almoco: string;
  retorno: string;
  saida: string;
  horas: string;
  totalMinutos: number;
  atrasoMinutos: number;
  status: StatusHistorico;
  statusBackend: StatusJornada;
  observacao: string;
}

interface GraficoSemana {
  semana: string;
  horas: number;
  minutos: number;
  atrasos: number;
  faltas: number;
}

interface SolicitacaoHistorico {
  id: number;
  protocolo: string;
  tipo: string;
  referenciaISO: string;
  referencia: string;
  enviadaEmISO: string;
  enviadaEm: string;
  status: StatusSolicitacaoVisual;
}

interface ResultadoHistorico {
  pontos: RegistroPontoResponse[];
  solicitacoes: SolicitacaoResponse[];
}

@Component({
  selector: 'app-historico-componente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './historico-componente.html',
  styleUrl: './historico-componente.css',
})
export class HistoricoComponente implements OnInit {
  filtroMes = this.obterMesAtual();
  filtroStatus = 'Todos';
  filtroBusca = '';

  registros: RegistroHistorico[] = [];
  solicitacoes: SolicitacaoHistorico[] = [];

  carregando = true;
  erro = '';

  readonly statusDisponiveis: Array<
    'Todos' | StatusHistorico
  > = [
    'Todos',
    'Completo',
    'Incompleto',
    'Atraso',
    'Falta justificada',
    'Falta',
  ];

  constructor(
    private readonly pontoService: PontoService,
    private readonly solicitacaoService: SolicitacaoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarHistorico();
  }

  get registrosDoMes(): RegistroHistorico[] {
    return this.registros.filter(
      (registro: RegistroHistorico) =>
        registro.dataISO.startsWith(this.filtroMes)
    );
  }

  get registrosFiltrados(): RegistroHistorico[] {
    const busca = this.filtroBusca.trim().toLowerCase();

    return this.registrosDoMes.filter(
      (registro: RegistroHistorico) => {
        const statusConfere =
          this.filtroStatus === 'Todos' ||
          registro.status === this.filtroStatus;

        const buscaConfere =
          !busca ||
          registro.data.toLowerCase().includes(busca) ||
          registro.diaSemana.toLowerCase().includes(busca) ||
          registro.observacao.toLowerCase().includes(busca) ||
          registro.status.toLowerCase().includes(busca);

        return statusConfere && buscaConfere;
      }
    );
  }

  get resumo(): ResumoHistorico[] {
    const registrosMes = this.registrosDoMes;

    const diasTrabalhados = registrosMes.filter(
      (registro: RegistroHistorico) =>
        registro.entrada !== '--:--'
    ).length;

    const totalMinutos = registrosMes.reduce(
      (
        total: number,
        registro: RegistroHistorico
      ) => total + registro.totalMinutos,
      0
    );

    const atrasos = registrosMes.filter(
      (registro: RegistroHistorico) =>
        registro.atrasoMinutos > 0 ||
        registro.statusBackend === 'ATRASO'
    ).length;

    const faltas = registrosMes.filter(
      (registro: RegistroHistorico) =>
        registro.statusBackend === 'FALTA'
    ).length;

    const justificadas = registrosMes.filter(
      (registro: RegistroHistorico) =>
        registro.statusBackend === 'JUSTIFICADA'
    ).length;

    return [
      {
        titulo: 'Dias trabalhados',
        valor: String(diasTrabalhados),
        detalhe: 'No mês selecionado',
        icone: 'bi-calendar-check',
        tipo: 'positivo',
      },
      {
        titulo: 'Horas registradas',
        valor: this.formatarMinutos(totalMinutos),
        detalhe: 'Soma das jornadas finalizadas',
        icone: 'bi-clock-history',
        tipo: 'neutro',
      },
      {
        titulo: 'Atrasos',
        valor: String(atrasos),
        detalhe:
          atrasos === 1
            ? 'Um registro com atraso'
            : `${atrasos} registros com atraso`,
        icone: 'bi-alarm',
        tipo: atrasos > 0 ? 'atencao' : 'positivo',
      },
      {
        titulo: 'Faltas',
        valor: String(faltas),
        detalhe: `${justificadas} falta(s) justificada(s)`,
        icone: 'bi-calendar-x',
        tipo: faltas > 0 ? 'perigo' : 'positivo',
      },
    ];
  }

  get graficoSemanas(): GraficoSemana[] {
    const partesMes = this.filtroMes.split('-');
    const ano = Number(partesMes[0]);
    const mes = Number(partesMes[1]);

    if (!ano || !mes) {
      return [];
    }

    const totalDias = new Date(ano, mes, 0).getDate();
    const quantidadeSemanas = Math.ceil(totalDias / 7);

    return Array.from(
      { length: quantidadeSemanas },
      (_valor: unknown, indice: number): GraficoSemana => {
        const numeroSemana = indice + 1;

        const registrosSemana = this.registrosDoMes.filter(
          (registro: RegistroHistorico) => {
            const dia = this.criarDataLocal(
              registro.dataISO
            ).getDate();

            return Math.ceil(dia / 7) === numeroSemana;
          }
        );

        const minutos = registrosSemana.reduce(
          (
            total: number,
            registro: RegistroHistorico
          ) => total + registro.totalMinutos,
          0
        );

        const atrasos = registrosSemana.filter(
          (registro: RegistroHistorico) =>
            registro.atrasoMinutos > 0 ||
            registro.statusBackend === 'ATRASO'
        ).length;

        const faltas = registrosSemana.filter(
          (registro: RegistroHistorico) =>
            registro.statusBackend === 'FALTA'
        ).length;

        return {
          semana: `Sem ${numeroSemana}`,
          horas: minutos / 60,
          minutos,
          atrasos,
          faltas,
        };
      }
    );
  }

  get solicitacoesFiltradas(): SolicitacaoHistorico[] {
    return this.solicitacoes.filter(
      (solicitacao: SolicitacaoHistorico) =>
        solicitacao.referenciaISO.startsWith(
          this.filtroMes
        ) ||
        solicitacao.enviadaEmISO.startsWith(
          this.filtroMes
        )
    );
  }

  carregarHistorico(): void {
    this.carregando = true;
    this.erro = '';

    forkJoin({
      pontos: this.pontoService.buscarMeuHistorico(),
      solicitacoes:
        this.solicitacaoService.listarMinhas(),
    })
      .pipe(timeout(10000))
      .subscribe({
        next: (resultado: ResultadoHistorico) => {
          this.registros = resultado.pontos.map(
            (
              registro: RegistroPontoResponse
            ): RegistroHistorico =>
              this.mapearRegistro(registro)
          );

          this.solicitacoes = resultado.solicitacoes
            .filter(
              (
                solicitacao: SolicitacaoResponse
              ): boolean =>
                this.tipoSolicitacaoHistorico(
                  solicitacao.tipo
                )
            )
            .map(
              (
                solicitacao: SolicitacaoResponse
              ): SolicitacaoHistorico =>
                this.mapearSolicitacao(solicitacao)
            );

          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: (erro: unknown) => {
          console.error(
            'Erro ao carregar o histórico:',
            erro
          );

          this.erro = this.obterMensagemErro(
            erro,
            'Não foi possível carregar o histórico.'
          );

          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  percentualHoras(horas: number): number {
    return Math.min(
      Math.round((horas / 40) * 100),
      100
    );
  }

  detalheSemana(item: GraficoSemana): string {
    return `${item.semana}: ${this.formatarMinutos(
      item.minutos
    )} registradas, ${item.atrasos} atraso(s) e ${
      item.faltas
    } falta(s).`;
  }

  horasSemanaFormatadas(item: GraficoSemana): string {
    return this.formatarMinutos(item.minutos);
  }

  limparFiltros(): void {
    this.filtroStatus = 'Todos';
    this.filtroBusca = '';
  }

  classeStatus(status: StatusHistorico): string {
    const classes: Record<StatusHistorico, string> = {
      Completo: 'text-bg-success',
      Incompleto: 'text-bg-warning',
      Atraso: 'text-bg-warning',
      'Falta justificada': 'text-bg-info',
      Falta: 'text-bg-danger',
    };

    return classes[status];
  }

  classeSolicitacao(
    status: StatusSolicitacaoVisual
  ): string {
    const classes: Record<
      StatusSolicitacaoVisual,
      string
    > = {
      Pendente: 'text-bg-warning',
      Aprovada: 'text-bg-success',
      Rejeitada: 'text-bg-danger',
    };

    return classes[status];
  }

  trackByRegistro(
    _index: number,
    registro: RegistroHistorico
  ): number {
    return registro.id;
  }

  trackBySolicitacao(
    _index: number,
    solicitacao: SolicitacaoHistorico
  ): number {
    return solicitacao.id;
  }

  trackBySemana(
    _index: number,
    semana: GraficoSemana
  ): string {
    return semana.semana;
  }

  private mapearRegistro(
    registro: RegistroPontoResponse
  ): RegistroHistorico {
    return {
      id: registro.id,
      dataISO: registro.dataRegistro,
      data: this.formatarData(registro.dataRegistro),
      diaSemana: this.formatarDiaSemana(
        registro.dataRegistro
      ),
      entrada: this.formatarHora(registro.entrada),
      almoco: this.formatarHora(
        registro.inicioIntervalo
      ),
      retorno: this.formatarHora(
        registro.fimIntervalo
      ),
      saida: this.formatarHora(registro.saida),
      horas: this.formatarMinutos(
        registro.totalTrabalhadoMinutos ?? 0
      ),
      totalMinutos:
        registro.totalTrabalhadoMinutos ?? 0,
      atrasoMinutos: registro.atrasoMinutos ?? 0,
      status: this.mapearStatusJornada(
        registro.status
      ),
      statusBackend: registro.status,
      observacao:
        this.criarObservacaoRegistro(registro),
    };
  }

  private mapearSolicitacao(
    solicitacao: SolicitacaoResponse
  ): SolicitacaoHistorico {
    const referenciaISO =
      solicitacao.dataReferencia ??
      solicitacao.criadoEm.substring(0, 10);

    const enviadaEmISO =
      solicitacao.criadoEm.substring(0, 10);

    return {
      id: solicitacao.id,
      protocolo: solicitacao.protocolo,
      tipo: this.nomeTipoSolicitacao(
        solicitacao.tipo
      ),
      referenciaISO,
      referencia: this.formatarData(referenciaISO),
      enviadaEmISO,
      enviadaEm: this.formatarData(enviadaEmISO),
      status: this.mapearStatusSolicitacao(
        solicitacao.status
      ),
    };
  }

  private mapearStatusJornada(
    status: StatusJornada
  ): StatusHistorico {
    const statusMapeados: Record<
      StatusJornada,
      StatusHistorico
    > = {
      EM_ANDAMENTO: 'Incompleto',
      CONCLUIDA: 'Completo',
      PENDENTE: 'Incompleto',
      ATRASO: 'Atraso',
      FALTA: 'Falta',
      JUSTIFICADA: 'Falta justificada',
    };

    return statusMapeados[status];
  }

  private mapearStatusSolicitacao(
    status: StatusSolicitacao
  ): StatusSolicitacaoVisual {
    const statusMapeados: Record<
      StatusSolicitacao,
      StatusSolicitacaoVisual
    > = {
      PENDENTE: 'Pendente',
      APROVADA: 'Aprovada',
      REJEITADA: 'Rejeitada',
    };

    return statusMapeados[status];
  }

  private criarObservacaoRegistro(
    registro: RegistroPontoResponse
  ): string {
    switch (registro.status) {
      case 'CONCLUIDA':
        return 'Jornada concluída sem atraso.';

      case 'ATRASO':
        return registro.saida
          ? `Jornada concluída com ${
              registro.atrasoMinutos ?? 0
            } minuto(s) de atraso.`
          : `Jornada em andamento com ${
              registro.atrasoMinutos ?? 0
            } minuto(s) de atraso.`;

      case 'EM_ANDAMENTO':
        return 'Jornada em andamento.';

      case 'PENDENTE':
        return 'Registro pendente de correção.';

      case 'FALTA':
        return 'Falta registrada sem justificativa aprovada.';

      case 'JUSTIFICADA':
        return 'Falta justificada e aprovada pelo RH.';

      default:
        return 'Registro de jornada.';
    }
  }

  private tipoSolicitacaoHistorico(
    tipo: TipoSolicitacao
  ): boolean {
    return (
      tipo === 'CORRECAO_PONTO' ||
      tipo === 'JUSTIFICATIVA_FALTA'
    );
  }

  private nomeTipoSolicitacao(
    tipo: TipoSolicitacao
  ): string {
    const nomes: Record<TipoSolicitacao, string> = {
      CORRECAO_PONTO: 'Correção de ponto',
      JUSTIFICATIVA_FALTA:
        'Justificativa de falta',
      SOLICITACAO_FERIAS:
        'Solicitação de férias',
      CORRECAO_CADASTRO:
        'Correção cadastral',
    };

    return nomes[tipo];
  }

  private obterMesAtual(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(
      agora.getMonth() + 1
    ).padStart(2, '0');

    return `${ano}-${mes}`;
  }

  private criarDataLocal(dataISO: string): Date {
    const partes = dataISO.split('-');
    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    return new Date(ano, mes - 1, dia);
  }

  private formatarData(dataISO: string): string {
    if (!dataISO) {
      return '--/--/----';
    }

    return this.criarDataLocal(
      dataISO
    ).toLocaleDateString('pt-BR');
  }

  private formatarDiaSemana(
    dataISO: string
  ): string {
    const diaSemana = this.criarDataLocal(
      dataISO
    ).toLocaleDateString('pt-BR', {
      weekday: 'long',
    });

    return (
      diaSemana.charAt(0).toUpperCase() +
      diaSemana.slice(1)
    );
  }

  private formatarHora(
    horario: string | null
  ): string {
    return horario
      ? horario.substring(0, 5)
      : '--:--';
  }

  private formatarMinutos(
    totalMinutos: number
  ): string {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    return `${String(horas).padStart(
      2,
      '0'
    )}h${String(minutos).padStart(2, '0')}`;
  }

  private obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string
  ): string {
    if (erro instanceof HttpErrorResponse) {
      if (erro.status === 0) {
        return 'Não foi possível conectar ao servidor.';
      }

      if (
        typeof erro.error?.mensagem === 'string'
      ) {
        return erro.error.mensagem;
      }

      if (
        typeof erro.error?.message === 'string'
      ) {
        return erro.error.message;
      }
    }

    if (
      typeof erro === 'object' &&
      erro !== null &&
      'name' in erro &&
      erro.name === 'TimeoutError'
    ) {
      return 'O servidor demorou muito para responder.';
    }

    return mensagemPadrao;
  }
}