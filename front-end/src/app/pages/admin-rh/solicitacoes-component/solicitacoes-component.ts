import { CommonModule } from '@angular/common';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { timeout } from 'rxjs';

import { SolicitacaoService } from '../../../core/services/solicitacao';

import {
  PrioridadeSolicitacao as PrioridadeSolicitacaoApi,
  SolicitacaoResponse,
  StatusSolicitacao as StatusSolicitacaoApi,
  TipoSolicitacao as TipoSolicitacaoApi,
} from '../../../models/solicitacao';

type StatusSolicitacao =
  | 'Pendente'
  | 'Aprovada'
  | 'Rejeitada';

type PrioridadeSolicitacao =
  | 'Normal'
  | 'Alta';

type TipoSolicitacao =
  | 'Correção de ponto'
  | 'Justificativa de falta'
  | 'Solicitação de férias'
  | 'Correção de cadastro';

interface SolicitacaoGestao {
  id: number;
  protocolo: string;
  funcionario: string;
  matricula: string;
  setor: string;
  cargo: string;
  tipo: TipoSolicitacao;
  prioridade: PrioridadeSolicitacao;
  dataSolicitacao: string;
  dataReferencia: string;
  descricao: string;
  status: StatusSolicitacao;
  anexo?: string;
  horarioSolicitado?: string;
  observacaoAnalise?: string;
  analisadoPor?: string;
  dataAnalise?: string;
}

@Component({
  selector: 'app-solicitacoes-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './solicitacoes-component.html',
  styleUrl: './solicitacoes-component.css',
})
export class SolicitacoesComponent
  implements OnInit {

  filtroBusca = '';
  filtroStatus = 'Todos';
  filtroTipo = 'Todos';
  filtroSetor = 'Todos';

  carregando = true;
  processandoAnalise = false;

  erroCarregamento = '';
  erroAnalise = '';
  mensagemFeedback = '';

  solicitacaoSelecionada:
    SolicitacaoGestao | null = null;

  observacaoAnalise = '';

  readonly statusDisponiveis = [
    'Todos',
    'Pendente',
    'Aprovada',
    'Rejeitada',
  ];

  solicitacoes: SolicitacaoGestao[] = [];

  constructor(
    private readonly solicitacaoService:
      SolicitacaoService,

    private readonly cdr:
      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes(): void {
    this.carregando = true;
    this.erroCarregamento = '';

    this.solicitacaoService
      .listarGerencial()
      .pipe(
        timeout(10000)
      )
      .subscribe({
        next: (solicitacoes) => {
          this.solicitacoes =
            solicitacoes.map(
              (solicitacao) =>
                this.converterSolicitacao(
                  solicitacao
                )
            );

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {
          console.error(
            'Erro ao carregar solicitações:',
            erro
          );

          this.erroCarregamento =
            this.obterMensagemErro(
              erro,
              'Não foi possível carregar as solicitações.'
            );

          this.carregando = false;

          this.cdr.detectChanges();
        },
      });
  }

  get tiposDisponiveis(): string[] {
    return [
      'Todos',
      ...new Set(
        this.solicitacoes.map(
          (item) => item.tipo
        )
      ),
    ];
  }

  get setoresDisponiveis(): string[] {
    return [
      'Todos',
      ...new Set(
        this.solicitacoes.map(
          (item) => item.setor
        )
      ),
    ];
  }

  get solicitacoesFiltradas():
    SolicitacaoGestao[] {

    const busca =
      this.normalizarTexto(
        this.filtroBusca
      );

    return this.solicitacoes.filter(
      (item) => {
        const correspondeBusca =
          !busca
          || [
            item.funcionario,
            item.protocolo,
            item.matricula,
            item.setor,
            item.tipo,
          ]
            .map((valor) =>
              this.normalizarTexto(valor)
            )
            .some((valor) =>
              valor.includes(busca)
            );

        const correspondeStatus =
          this.filtroStatus === 'Todos'
          || item.status ===
            this.filtroStatus;

        const correspondeTipo =
          this.filtroTipo === 'Todos'
          || item.tipo ===
            this.filtroTipo;

        const correspondeSetor =
          this.filtroSetor === 'Todos'
          || item.setor ===
            this.filtroSetor;

        return correspondeBusca
          && correspondeStatus
          && correspondeTipo
          && correspondeSetor;
      }
    );
  }

  get totalPendentes(): number {
    return this.solicitacoes.filter(
      (item) =>
        item.status === 'Pendente'
    ).length;
  }

  get totalAltaPrioridade(): number {
    return this.solicitacoes.filter(
      (item) =>
        item.status === 'Pendente'
        && item.prioridade === 'Alta'
    ).length;
  }

  get totalAprovadas(): number {
    return this.solicitacoes.filter(
      (item) =>
        item.status === 'Aprovada'
    ).length;
  }

  get totalRejeitadas(): number {
    return this.solicitacoes.filter(
      (item) =>
        item.status === 'Rejeitada'
    ).length;
  }

  get quantidadeFiltrosAtivos(): number {
    return [
      this.filtroBusca.trim() !== '',
      this.filtroStatus !== 'Todos',
      this.filtroTipo !== 'Todos',
      this.filtroSetor !== 'Todos',
    ].filter(Boolean).length;
  }

  abrirDetalhes(
    solicitacao: SolicitacaoGestao
  ): void {
    this.solicitacaoSelecionada =
      solicitacao;

    this.observacaoAnalise =
      solicitacao.observacaoAnalise
      ?? '';

    this.erroAnalise = '';
  }

  fecharDetalhes(): void {
    if (this.processandoAnalise) {
      return;
    }

    this.solicitacaoSelecionada =
      null;

    this.observacaoAnalise = '';
    this.erroAnalise = '';
  }

  aprovarSelecionada(): void {
    const solicitacao =
      this.solicitacaoSelecionada;

    if (
      !solicitacao
      || this.processandoAnalise
    ) {
      return;
    }

    this.processandoAnalise = true;
    this.erroAnalise = '';

    const observacao =
      this.observacaoAnalise.trim();

    this.solicitacaoService
      .aprovar(
        solicitacao.id,
        {
          observacao:
            observacao || undefined,
        }
      )
      .pipe(
        timeout(10000)
      )
      .subscribe({
        next: (resposta) => {
          this.finalizarAnalise(
            resposta,
            'aprovada'
          );
        },

        error: (
          erro: HttpErrorResponse
        ) => {
          console.error(
            'Erro ao aprovar solicitação:',
            erro
          );

          this.erroAnalise =
            this.obterMensagemErro(
              erro,
              'Não foi possível aprovar a solicitação.'
            );

          this.processandoAnalise = false;

          this.cdr.detectChanges();
        },
      });
  }

  rejeitarSelecionada(): void {
    const solicitacao =
      this.solicitacaoSelecionada;

    if (
      !solicitacao
      || this.processandoAnalise
    ) {
      return;
    }

    const observacao =
      this.observacaoAnalise.trim();

    if (observacao.length < 5) {
      this.erroAnalise =
        'Informe um motivo com pelo menos 5 caracteres.';

      return;
    }

    this.processandoAnalise = true;
    this.erroAnalise = '';

    this.solicitacaoService
      .rejeitar(
        solicitacao.id,
        {
          observacao,
        }
      )
      .pipe(
        timeout(10000)
      )
      .subscribe({
        next: (resposta) => {
          this.finalizarAnalise(
            resposta,
            'rejeitada'
          );
        },

        error: (
          erro: HttpErrorResponse
        ) => {
          console.error(
            'Erro ao rejeitar solicitação:',
            erro
          );

          this.erroAnalise =
            this.obterMensagemErro(
              erro,
              'Não foi possível rejeitar a solicitação.'
            );

          this.processandoAnalise = false;

          this.cdr.detectChanges();
        },
      });
  }

  limparFiltros(): void {
    this.filtroBusca = '';
    this.filtroStatus = 'Todos';
    this.filtroTipo = 'Todos';
    this.filtroSetor = 'Todos';
  }

  statusClasse(
    status: StatusSolicitacao
  ): string {
    const classes:
      Record<StatusSolicitacao, string> = {

      Pendente:
        'status-pendente',

      Aprovada:
        'status-aprovada',

      Rejeitada:
        'status-rejeitada',
    };

    return classes[status];
  }

  prioridadeClasse(
    prioridade: PrioridadeSolicitacao
  ): string {
    return prioridade === 'Alta'
      ? 'prioridade-alta'
      : 'prioridade-normal';
  }

  tipoClasse(
    tipo: TipoSolicitacao
  ): string {
    const classes:
      Record<TipoSolicitacao, string> = {

      'Correção de ponto':
        'tipo-ponto',

      'Justificativa de falta':
        'tipo-falta',

      'Solicitação de férias':
        'tipo-ferias',

      'Correção de cadastro':
        'tipo-cadastro',
    };

    return classes[tipo];
  }

  tipoIcone(
    tipo: TipoSolicitacao
  ): string {
    const icones:
      Record<TipoSolicitacao, string> = {

      'Correção de ponto':
        'bi-clock-history',

      'Justificativa de falta':
        'bi-calendar-x',

      'Solicitação de férias':
        'bi-suitcase-lg',

      'Correção de cadastro':
        'bi-person-lines-fill',
    };

    return icones[tipo];
  }

  iniciais(
    nome: string
  ): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) =>
        parte[0].toUpperCase()
      )
      .join('');
  }

  trackById(
    _index: number,
    item: SolicitacaoGestao
  ): number {
    return item.id;
  }

  private finalizarAnalise(
    resposta: SolicitacaoResponse,
    acao: 'aprovada' | 'rejeitada'
  ): void {
    const solicitacaoAtualizada =
      this.converterSolicitacao(
        resposta
      );

    this.solicitacoes =
      this.solicitacoes.map(
        (item) =>
          item.id ===
          solicitacaoAtualizada.id
            ? solicitacaoAtualizada
            : item
      );

    this.mensagemFeedback =
      `${solicitacaoAtualizada.protocolo} foi ${acao} com sucesso.`;

    this.processandoAnalise = false;

    this.solicitacaoSelecionada =
      null;

    this.observacaoAnalise = '';
    this.erroAnalise = '';

    this.cdr.detectChanges();
  }

  private converterSolicitacao(
    solicitacao: SolicitacaoResponse
  ): SolicitacaoGestao {
    return {
      id:
        solicitacao.id,

      protocolo:
        solicitacao.protocolo,

      funcionario:
        solicitacao.nomeFuncionario,

      matricula:
        solicitacao.matricula,

      setor:
        solicitacao.setor,

      cargo:
        solicitacao.cargo,

      tipo:
        this.converterTipo(
          solicitacao.tipo
        ),

      prioridade:
        this.converterPrioridade(
          solicitacao.prioridade
        ),

      dataSolicitacao:
        this.formatarDataHora(
          solicitacao.criadoEm
        ),

      dataReferencia:
        this.obterReferencia(
          solicitacao
        ),

      descricao:
        solicitacao.justificativa,

      status:
        this.converterStatus(
          solicitacao.status
        ),

      anexo:
        solicitacao.nomeAnexo
        || undefined,

      horarioSolicitado:
        this.obterHorariosSolicitados(
          solicitacao
        ),

      observacaoAnalise:
        solicitacao.observacaoAnalise
        || undefined,

      analisadoPor:
        solicitacao.nomeAnalisadoPor
        || undefined,

      dataAnalise:
        solicitacao.analisadoEm
          ? this.formatarDataHora(
              solicitacao.analisadoEm
            )
          : undefined,
    };
  }

  private converterTipo(
    tipo: TipoSolicitacaoApi
  ): TipoSolicitacao {
    const tipos:
      Record<
        TipoSolicitacaoApi,
        TipoSolicitacao
      > = {

      CORRECAO_PONTO:
        'Correção de ponto',

      JUSTIFICATIVA_FALTA:
        'Justificativa de falta',

      SOLICITACAO_FERIAS:
        'Solicitação de férias',

      CORRECAO_CADASTRO:
        'Correção de cadastro',
    };

    return tipos[tipo];
  }

  private converterStatus(
    status: StatusSolicitacaoApi
  ): StatusSolicitacao {
    const statusMap:
      Record<
        StatusSolicitacaoApi,
        StatusSolicitacao
      > = {

      PENDENTE:
        'Pendente',

      APROVADA:
        'Aprovada',

      REJEITADA:
        'Rejeitada',
    };

    return statusMap[status];
  }

  private converterPrioridade(
    prioridade:
      PrioridadeSolicitacaoApi
  ): PrioridadeSolicitacao {
    return prioridade === 'ALTA'
      ? 'Alta'
      : 'Normal';
  }

  private obterReferencia(
    solicitacao: SolicitacaoResponse
  ): string {
    if (
      solicitacao.tipo
      === 'SOLICITACAO_FERIAS'
    ) {
      return `${this.formatarData(
        solicitacao.dataInicio
      )} a ${this.formatarData(
        solicitacao.dataFim
      )}`;
    }

    if (
      solicitacao.tipo
      === 'CORRECAO_CADASTRO'
    ) {
      const campo =
        this.formatarCampoCadastro(
          solicitacao.campoCadastro
        );

      return `${campo}: ${
        solicitacao.novoValor
        || 'Não informado'
      }`;
    }

    return this.formatarData(
      solicitacao.dataReferencia
    );
  }

  private obterHorariosSolicitados(
    solicitacao: SolicitacaoResponse
  ): string | undefined {
    const horarios = [
      {
        label: 'Entrada',
        valor:
          solicitacao.entradaSolicitada,
      },
      {
        label: 'Início intervalo',
        valor:
          solicitacao.inicioIntervaloSolicitado,
      },
      {
        label: 'Fim intervalo',
        valor:
          solicitacao.fimIntervaloSolicitado,
      },
      {
        label: 'Saída',
        valor:
          solicitacao.saidaSolicitada,
      },
    ]
      .filter((item) => item.valor)
      .map(
        (item) =>
          `${item.label}: ${
            this.formatarHora(
              item.valor
            )
          }`
      );

    return horarios.length
      ? horarios.join(' · ')
      : undefined;
  }

  private formatarCampoCadastro(
    campo: string | null
  ): string {
    if (!campo) {
      return 'Campo cadastral';
    }

    const campos:
      Record<string, string> = {

      nome:
        'Nome',

      'nome completo':
        'Nome',

      email:
        'E-mail corporativo',

      'email corporativo':
        'E-mail corporativo',

      cpf:
        'CPF',

      telefone:
        'Telefone',

      'data nascimento':
        'Data de nascimento',

      'data de nascimento':
        'Data de nascimento',

      'estado civil':
        'Estado civil',

      nacionalidade:
        'Nacionalidade',

      naturalidade:
        'Naturalidade',

      'local trabalho':
        'Local de trabalho',

      'local de trabalho':
        'Local de trabalho',
    };

    return campos[
      campo.toLowerCase().trim()
    ] ?? campo;
  }

  private formatarHora(
    hora: string | null
  ): string {
    if (!hora) {
      return 'Não informado';
    }

    return hora.substring(0, 5);
  }

  private formatarData(
    data: string | null
  ): string {
    if (!data) {
      return 'Não informada';
    }

    const [
      ano,
      mes,
      dia,
    ] = data.split('-');

    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  }

  private formatarDataHora(
    dataHora: string
  ): string {
    return this.formatarData(
      dataHora.split('T')[0]
    );
  }

  private obterMensagemErro(
    erro: HttpErrorResponse,
    mensagemPadrao: string
  ): string {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    if (
      typeof erro.error?.mensagem
      === 'string'
    ) {
      return erro.error.mensagem;
    }

    if (
      typeof erro.error?.message
      === 'string'
    ) {
      return erro.error.message;
    }

    return mensagemPadrao;
  }

  private normalizarTexto(
    valor: string
  ): string {
    return valor
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim();
  }
}