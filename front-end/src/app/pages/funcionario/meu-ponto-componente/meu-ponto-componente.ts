import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';

import { PontoService } from '../../../core/services/ponto.service';
import {RegistroPontoResponse,StatusJornada,TipoMarcacao,} from '../../../models/ponto';

interface AcaoPonto {
  tipo: TipoMarcacao;
  nome: string;
  descricao: string;
  icone: string;
}

type StatusRegistroVisual =
  | 'Registrado'
  | 'Registrado agora';

interface RegistroPontoVisual {
  tipoMarcacao: TipoMarcacao;
  tipo: string;
  horario: string;
  status: StatusRegistroVisual;
  icone: string;
  observacao: string;
}

interface ResumoPonto {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo: 'positivo' | 'atencao' | 'neutro' | 'perigo';
}

@Component({
  selector: 'app-meu-ponto-componente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meu-ponto-componente.html',
  styleUrl: './meu-ponto-componente.css',
})
export class MeuPontoComponente implements OnInit {
  readonly modoGestao: boolean;

  registroHoje: RegistroPontoResponse | null = null;

  carregando = true;
  registrando = false;
  marcacaoEmProcessamento: TipoMarcacao | null = null;

  erro = '';
  mensagemSucesso = '';
  ultimaMarcacao: TipoMarcacao | null = null;

  readonly dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  readonly acoesPonto: AcaoPonto[] = [
    {
      tipo: 'ENTRADA',
      nome: 'Entrada',
      descricao: 'Registrar início da jornada',
      icone: 'bi-box-arrow-in-right',
    },
    {
      tipo: 'INICIO_INTERVALO',
      nome: 'Almoço',
      descricao: 'Registrar saída para o intervalo',
      icone: 'bi-cup-hot',
    },
    {
      tipo: 'FIM_INTERVALO',
      nome: 'Retorno',
      descricao: 'Registrar volta do intervalo',
      icone: 'bi-arrow-return-left',
    },
    {
      tipo: 'SAIDA',
      nome: 'Saída',
      descricao: 'Registrar encerramento da jornada',
      icone: 'bi-box-arrow-right',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pontoService: PontoService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.modoGestao =
      this.route.snapshot.data['area'] === 'gestao';
  }

  ngOnInit(): void {
    this.carregarPontoHoje();
  }

  get registros(): RegistroPontoVisual[] {
    return this.acoesPonto
      .map(
        (
          acao: AcaoPonto
        ): RegistroPontoVisual | null => {
        const horario = this.obterHorario(acao.tipo);

        if (!horario) {
          return null;
        }

        return {
          tipoMarcacao: acao.tipo,
          tipo: acao.nome,
          horario: this.formatarHora(horario),
          status:
            this.ultimaMarcacao === acao.tipo
              ? 'Registrado agora'
              : 'Registrado',
          icone: acao.icone,
          observacao: this.obterObservacao(acao.tipo),
        };
      })
      .filter(
        (
          registro: RegistroPontoVisual | null
        ): registro is RegistroPontoVisual =>
          registro !== null
      );
  }

  get resumo(): ResumoPonto[] {
    return [
      {
        titulo: 'Entrada prevista',
        valor: '08:00',
        detalhe: 'Tolerância até 08:30',
        icone: 'bi-alarm',
        tipo: 'neutro',
      },
      {
        titulo: 'Horas trabalhadas',
        valor: this.formatarMinutos(
          this.registroHoje?.totalTrabalhadoMinutos ?? 0
        ),
        detalhe: this.registroHoje?.saida
          ? 'Jornada calculada pelo sistema'
          : 'Calculado ao registrar a saída',
        icone: 'bi-hourglass-split',
        tipo: this.registroHoje?.saida
          ? 'positivo'
          : 'neutro',
      },
      {
        titulo: 'Status do dia',
        valor: this.statusDoDia,
        detalhe: this.proximaAcao
          ? `Próxima ação: ${this.proximaAcao.nome}`
          : this.detalheStatus,
        icone: 'bi-activity',
        tipo: this.tipoResumoStatus,
      },
      {
        titulo: 'Atraso registrado',
        valor: `${this.registroHoje?.atrasoMinutos ?? 0} min`,
        detalhe:
          (this.registroHoje?.atrasoMinutos ?? 0) > 0
            ? 'Calculado a partir das 08:00'
            : 'Nenhum atraso contabilizado',
        icone: 'bi-clock-history',
        tipo:
          (this.registroHoje?.atrasoMinutos ?? 0) > 0
            ? 'perigo'
            : 'positivo',
      },
    ];
  }

  get percentualJornada(): number {
    return Math.round(
      (this.registros.length / this.acoesPonto.length) * 100
    );
  }

  get proximaMarcacao(): TipoMarcacao | null {
    if (!this.registroHoje) {
      return 'ENTRADA';
    }

    return this.registroHoje.proximaMarcacao;
  }

  get proximaAcao(): AcaoPonto | undefined {
    const proxima = this.proximaMarcacao;

    return this.acoesPonto.find(
      (acao) => acao.tipo === proxima
    );
  }

  get statusDoDia(): string {
    if (!this.registroHoje) {
      return 'Aguardando entrada';
    }

    const status: Record<StatusJornada, string> = {
      EM_ANDAMENTO: 'Em andamento',
      CONCLUIDA: 'Jornada finalizada',
      PENDENTE: 'Pendente de correção',
      ATRASO: this.registroHoje.saida
        ? 'Jornada finalizada com atraso'
        : 'Em andamento com atraso',
      FALTA: 'Falta registrada',
      JUSTIFICADA: 'Falta justificada',
    };

    return status[this.registroHoje.status];
  }

  get detalheStatus(): string {
    if (!this.registroHoje) {
      return 'Registre a entrada para iniciar';
    }

    const detalhes: Record<StatusJornada, string> = {
      EM_ANDAMENTO: 'Jornada em andamento',
      CONCLUIDA: 'Todos os registros concluídos',
      PENDENTE: 'Solicite uma correção de ponto',
      ATRASO: this.registroHoje.saida
        ? 'Todos os registros concluídos'
        : 'Jornada em andamento',
      FALTA: 'Registro indisponível para marcação',
      JUSTIFICADA: 'Ausência justificada pelo RH',
    };

    return detalhes[this.registroHoje.status];
  }

  get tipoResumoStatus(): ResumoPonto['tipo'] {
    if (!this.registroHoje) {
      return 'atencao';
    }

    if (
      this.registroHoje.status === 'CONCLUIDA' ||
      this.registroHoje.status === 'JUSTIFICADA'
    ) {
      return 'positivo';
    }

    if (
      this.registroHoje.status === 'FALTA' ||
      this.registroHoje.status === 'PENDENTE'
    ) {
      return 'perigo';
    }

    return 'atencao';
  }

  get mensagemBloqueioJornada(): string {
    if (!this.registroHoje || this.proximaMarcacao) {
      return '';
    }

    switch (this.registroHoje.status) {
      case 'CONCLUIDA':
        return 'A jornada de hoje já foi finalizada.';
      case 'PENDENTE':
        return 'O registro de hoje está pendente e só pode ser ajustado por uma solicitação de correção.';
      case 'FALTA':
        return 'O dia está registrado como falta. Envie uma justificativa ao RH.';
      case 'JUSTIFICADA':
        return 'A ausência de hoje já foi justificada.';
      default:
        return '';
    }
  }

  carregarPontoHoje(): void {
    this.carregando = true;
    this.erro = '';
    this.mensagemSucesso = '';
    this.ultimaMarcacao = null;

    this.pontoService
      .buscarHoje()
      .pipe(timeout(10000))
      .subscribe({
        next: (
          registro: RegistroPontoResponse | null
        ) => {
          this.registroHoje = registro;
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: (erro: unknown) => {
          console.error('Erro ao carregar o ponto de hoje:', erro);
          this.erro = this.obterMensagemErro(
            erro,
            'Não foi possível carregar os registros de hoje.'
          );
          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  registrado(tipo: TipoMarcacao): boolean {
    return this.obterHorario(tipo) !== null;
  }

  horarioRegistrado(tipo: TipoMarcacao): string {
    const horario = this.obterHorario(tipo);

    return horario
      ? `Registrado às ${this.formatarHora(horario)}`
      : '';
  }

  podeRegistrar(acao: AcaoPonto): boolean {
    if (
      this.carregando ||
      this.registrando ||
      this.registrado(acao.tipo)
    ) {
      return false;
    }

    if (
      acao.tipo === 'ENTRADA' &&
      new Date().getHours() < 8
    ) {
      return false;
    }

    return this.proximaMarcacao === acao.tipo;
  }

  textoAcao(acao: AcaoPonto): string {
    if (this.registrado(acao.tipo)) {
      return this.horarioRegistrado(acao.tipo);
    }

    if (
      acao.tipo === 'ENTRADA' &&
      new Date().getHours() < 8
    ) {
      return 'Disponível a partir das 08:00';
    }

    if (this.proximaMarcacao === acao.tipo) {
      return acao.descricao;
    }

    if (!this.proximaMarcacao) {
      return 'Indisponível para o status atual';
    }

    return `Aguardando ${this.proximaAcao?.nome.toLowerCase()}`;
  }

  registrarProximaAcao(): void {
    if (this.proximaAcao) {
      this.registrarPonto(this.proximaAcao);
    }
  }

  registrarPonto(acao: AcaoPonto): void {
    if (!this.podeRegistrar(acao)) {
      return;
    }

    this.registrando = true;
    this.marcacaoEmProcessamento = acao.tipo;
    this.erro = '';
    this.mensagemSucesso = '';

    this.pontoService
      .marcar(acao.tipo)
      .pipe(timeout(10000))
      .subscribe({
        next: (
          registro: RegistroPontoResponse
        ) => {
          this.registroHoje = registro;
          this.ultimaMarcacao = acao.tipo;
          this.mensagemSucesso = `${acao.nome} registrada com sucesso às ${this.formatarHora(
            this.obterHorario(acao.tipo) ?? ''
          )}.`;
          this.registrando = false;
          this.marcacaoEmProcessamento = null;
          this.cdr.detectChanges();
        },
        error: (erro: unknown) => {
          console.error('Erro ao registrar ponto:', erro);
          this.erro = this.obterMensagemErro(
            erro,
            `Não foi possível registrar ${acao.nome.toLowerCase()}.`
          );
          this.registrando = false;
          this.marcacaoEmProcessamento = null;
          this.cdr.detectChanges();
        },
      });
  }

  classeStatus(status: StatusRegistroVisual): string {
    const classes: Record<StatusRegistroVisual, string> = {
      Registrado: 'text-bg-success',
      'Registrado agora': 'text-bg-primary',
    };

    return classes[status];
  }

  trackByTipo(
    _index: number,
    item: AcaoPonto | RegistroPontoVisual
  ): TipoMarcacao {
    return 'tipoMarcacao' in item
      ? item.tipoMarcacao
      : item.tipo;
  }

  private obterHorario(tipo: TipoMarcacao): string | null {
    if (!this.registroHoje) {
      return null;
    }

    const horarios: Record<TipoMarcacao, string | null> = {
      ENTRADA: this.registroHoje.entrada,
      INICIO_INTERVALO: this.registroHoje.inicioIntervalo,
      FIM_INTERVALO: this.registroHoje.fimIntervalo,
      SAIDA: this.registroHoje.saida,
    };

    return horarios[tipo];
  }

  private obterObservacao(tipo: TipoMarcacao): string {
    const observacoes: Record<TipoMarcacao, string> = {
      ENTRADA:
        (this.registroHoje?.atrasoMinutos ?? 0) > 0
          ? `Entrada com ${this.registroHoje?.atrasoMinutos} minuto(s) de atraso.`
          : 'Entrada registrada dentro da tolerância.',
      INICIO_INTERVALO: 'Início do intervalo registrado.',
      FIM_INTERVALO: 'Retorno do intervalo registrado.',
      SAIDA: 'Encerramento da jornada registrado.',
    };

    return observacoes[tipo];
  }

  private formatarHora(hora: string): string {
    return hora ? hora.substring(0, 5) : '--:--';
  }

  private formatarMinutos(totalMinutos: number): string {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    return `${String(horas).padStart(2, '0')}h${String(
      minutos
    ).padStart(2, '0')}`;
  }

  private obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string
  ): string {
    if (erro instanceof HttpErrorResponse) {
      if (erro.status === 0) {
        return 'Não foi possível conectar ao servidor.';
      }

      if (typeof erro.error?.mensagem === 'string') {
        return erro.error.mensagem;
      }

      if (typeof erro.error?.message === 'string') {
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