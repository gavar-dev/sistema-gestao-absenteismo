import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {ChangeDetectorRef,Component,OnInit,} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, timeout } from 'rxjs';

import { AvisoService } from '../../../core/services/aviso.service';
import { FuncionarioService } from '../../../core/services/funcionario';
import { PontoService } from '../../../core/services/ponto.service';
import { SolicitacaoService } from '../../../core/services/solicitacao';

import {AvisoResponse,NivelAviso,} from '../../../models/aviso';
import { FuncionarioResponse } from '../../../models/funcionario';
import {RegistroPontoResponse,StatusJornada,TipoMarcacao,} from '../../../models/ponto';
import {SolicitacaoResponse,TipoSolicitacao,} from '../../../models/solicitacao';

interface CardResumoFuncionario {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo:
    | 'positivo'
    | 'atencao'
    | 'neutro'
    | 'perigo';
}

interface AcaoRapida {
  titulo: string;
  descricao: string;
  icone: string;
  rota: string;
  destaque?: boolean;
}

type StatusRegistroDia =
  | 'Registrado'
  | 'Pendente'
  | 'Previsto'
  | 'Indisponível';

interface RegistroDia {
  tipoMarcacao: TipoMarcacao;
  tipo: string;
  horario: string;
  status: StatusRegistroDia;
  icone: string;
}

interface PendenciaFuncionario {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  tipo:
    | 'warning'
    | 'danger'
    | 'info'
    | 'success';
  icone: string;
  rota: string;
}

interface MetaSemanal {
  dataISO: string;
  dia: string;
  horas: number;
  minutos: number;
  meta: number;
}

interface ResultadoInicio {
  perfil: FuncionarioResponse;
  pontoHoje: RegistroPontoResponse | null;
  historico: RegistroPontoResponse[];
  solicitacoes: SolicitacaoResponse[];
  avisos: AvisoResponse[];
}

@Component({
  selector: 'app-inicio-componente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './inicio-componente.html',
  styleUrl: './inicio-componente.css',
})
export class InicioComponente
  implements OnInit {

  perfil: FuncionarioResponse | null = null;
  pontoHoje: RegistroPontoResponse | null = null;
  historico: RegistroPontoResponse[] = [];
  solicitacoes: SolicitacaoResponse[] = [];
  avisos: AvisoResponse[] = [];

  carregando = true;
  erro = '';

  readonly acoesRapidas: AcaoRapida[] = [
    {
      titulo: 'Bater ponto',
      descricao:
        'Registrar entrada, almoço, retorno ou saída.',
      icone: 'bi-fingerprint',
      rota: '/meus-pontos',
      destaque: true,
    },
    {
      titulo: 'Solicitar correção',
      descricao:
        'Ajustar ponto, justificar ausência ou abrir outro pedido.',
      icone: 'bi-pencil-square',
      rota: '/solicitacao',
    },
    {
      titulo: 'Ver histórico',
      descricao:
        'Consultar registros anteriores e status do mês.',
      icone: 'bi-clock-history',
      rota: '/historico',
    },
    {
      titulo: 'Meus dados',
      descricao:
        'Visualizar dados pessoais e profissionais.',
      icone: 'bi-person-vcard',
      rota: '/meus-dados',
    },
  ];

  private readonly marcacoes: Array<{
    tipo: TipoMarcacao;
    nome: string;
    icone: string;
  }> = [
    {
      tipo: 'ENTRADA',
      nome: 'Entrada',
      icone: 'bi-box-arrow-in-right',
    },
    {
      tipo: 'INICIO_INTERVALO',
      nome: 'Saída almoço',
      icone: 'bi-cup-hot',
    },
    {
      tipo: 'FIM_INTERVALO',
      nome: 'Retorno almoço',
      icone: 'bi-arrow-return-left',
    },
    {
      tipo: 'SAIDA',
      nome: 'Saída',
      icone: 'bi-box-arrow-right',
    },
  ];

  constructor(
    private readonly funcionarioService:
      FuncionarioService,

    private readonly pontoService:
      PontoService,

    private readonly solicitacaoService:
      SolicitacaoService,

    private readonly avisoService:
      AvisoService,

    private readonly cdr:
      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarInicio();
  }

  get nomeFuncionario(): string {
    return this.perfil?.nomeCompleto ??
      'Funcionário';
  }

  get primeiroNome(): string {
    return this.nomeFuncionario
      .trim()
      .split(/\s+/)[0] ||
      'Funcionário';
  }

  get cargoFuncionario(): string {
    return this.perfil?.cargo ??
      'Cargo não informado';
  }

  get setorFuncionario(): string {
    return this.perfil?.setor ??
      'Setor não informado';
  }

  get statusHoje(): string {
    if (!this.pontoHoje) {
      return 'Aguardando entrada';
    }

    const nomes: Record<
      StatusJornada,
      string
    > = {
      EM_ANDAMENTO:
        'Jornada em andamento',

      CONCLUIDA:
        'Jornada concluída',

      PENDENTE:
        'Ponto pendente',

      ATRASO:
        this.pontoHoje.saida
          ? 'Jornada concluída com atraso'
          : 'Jornada em andamento com atraso',

      FALTA:
        'Falta registrada',

      JUSTIFICADA:
        'Ausência justificada',
    };

    return nomes[this.pontoHoje.status];
  }

  get proximaAcao(): string {
    const tipo =
      this.proximaMarcacao;

    if (!tipo) {
      if (
        this.pontoHoje?.status ===
        'CONCLUIDA'
      ) {
        return 'Jornada finalizada';
      }

      if (
        this.pontoHoje?.status ===
        'FALTA'
      ) {
        return 'Enviar justificativa';
      }

      if (
        this.pontoHoje?.status ===
        'PENDENTE'
      ) {
        return 'Solicitar correção';
      }

      return 'Nenhuma ação pendente';
    }

    const nomes: Record<
      TipoMarcacao,
      string
    > = {
      ENTRADA:
        'Registrar entrada',

      INICIO_INTERVALO:
        'Registrar saída para almoço',

      FIM_INTERVALO:
        'Registrar retorno do almoço',

      SAIDA:
        'Registrar saída',
    };

    return nomes[tipo];
  }

  get horarioProximaAcao(): string {
    return this.proximaMarcacao
      ? 'Agora'
      : '--:--';
  }

  get proximaMarcacao():
    TipoMarcacao | null {

    if (!this.pontoHoje) {
      return 'ENTRADA';
    }

    return this.pontoHoje
      .proximaMarcacao;
  }

  get solicitacoesPendentes(): number {
    return this.solicitacoes.filter(
      (
        solicitacao:
          SolicitacaoResponse
      ): boolean =>
        solicitacao.status ===
        'PENDENTE'
    ).length;
  }

  get avisosNaoLidos(): number {
    const idsLidos =
      this.carregarIdsAvisosLidos();

    return this.avisos.filter(
      (aviso: AvisoResponse): boolean =>
        !idsLidos.has(aviso.id)
    ).length;
  }

  get horasHojeMinutos(): number {
    return this.calcularMinutosRegistro(
      this.pontoHoje
    );
  }

  get resumo():
    CardResumoFuncionario[] {

    const entrada =
      this.formatarHora(
        this.pontoHoje?.entrada ?? null
      );

    const atraso =
      this.pontoHoje?.atrasoMinutos ?? 0;

    return [
      {
        titulo: 'Entrada de hoje',
        valor: entrada,
        detalhe:
          !this.pontoHoje?.entrada
            ? 'Aguardando registro'
            : atraso > 0
              ? `${atraso} minuto(s) de atraso`
              : 'Dentro da tolerância',
        icone:
          'bi-box-arrow-in-right',
        tipo:
          !this.pontoHoje?.entrada
            ? 'atencao'
            : atraso > 0
              ? 'perigo'
              : 'positivo',
      },
      {
        titulo: 'Horas trabalhadas',
        valor:
          this.formatarMinutos(
            this.horasHojeMinutos
          ),
        detalhe:
          this.pontoHoje?.saida
            ? 'Jornada calculada pelo sistema'
            : 'Parcial da jornada atual',
        icone:
          'bi-hourglass-split',
        tipo: 'neutro',
      },
      {
        titulo: 'Solicitações pendentes',
        valor:
          String(
            this.solicitacoesPendentes
          ),
        detalhe:
          this.solicitacoesPendentes > 0
            ? 'Aguardando análise do RH'
            : 'Nenhum pedido aguardando',
        icone:
          'bi-file-earmark-text',
        tipo:
          this.solicitacoesPendentes > 0
            ? 'atencao'
            : 'positivo',
      },
      {
        titulo: 'Avisos não lidos',
        valor:
          String(this.avisosNaoLidos),
        detalhe:
          this.avisosNaoLidos > 0
            ? 'Comunicados para conferir'
            : 'Todos os avisos foram lidos',
        icone: 'bi-bell',
        tipo:
          this.avisosNaoLidos > 0
            ? 'atencao'
            : 'positivo',
      },
    ];
  }

  get registrosHoje(): RegistroDia[] {
    const jornadaBloqueada =
      this.pontoHoje !== null &&
      [
        'CONCLUIDA',
        'PENDENTE',
        'FALTA',
        'JUSTIFICADA',
      ].includes(
        this.pontoHoje.status
      );

    return this.marcacoes.map(
      (
        marcacao: {
          tipo: TipoMarcacao;
          nome: string;
          icone: string;
        }
      ): RegistroDia => {

        const horario =
          this.obterHorarioMarcacao(
            marcacao.tipo
          );

        let status:
          StatusRegistroDia;

        if (horario) {
          status = 'Registrado';
        } else if (
          this.proximaMarcacao ===
          marcacao.tipo
        ) {
          status = 'Pendente';
        } else if (jornadaBloqueada) {
          status = 'Indisponível';
        } else {
          status = 'Previsto';
        }

        return {
          tipoMarcacao:
            marcacao.tipo,
          tipo: marcacao.nome,
          horario:
            this.formatarHora(horario),
          status,
          icone: marcacao.icone,
        };
      }
    );
  }

  get metasSemana(): MetaSemanal[] {
    const inicioSemana =
      this.obterInicioSemana();

    const metaDiaria =
      (
        this.perfil
          ?.cargaHorariaSemanal ??
        40
      ) / 5;

    return Array.from(
      { length: 5 },
      (
        _valor: unknown,
        indice: number
      ): MetaSemanal => {

        const data =
          new Date(inicioSemana);

        data.setDate(
          inicioSemana.getDate() +
          indice
        );

        const dataISO =
          this.formatarDataISO(data);

        const registro =
          dataISO ===
          this.formatarDataISO(
            new Date()
          )
            ? this.pontoHoje
            : this.historico.find(
                (
                  item:
                    RegistroPontoResponse
                ): boolean =>
                  item.dataRegistro ===
                  dataISO
              ) ?? null;

        const minutos =
          this.calcularMinutosRegistro(
            registro
          );

        return {
          dataISO,
          dia:
            this.nomeDiaSemana(data),
          horas: minutos / 60,
          minutos,
          meta: metaDiaria,
        };
      }
    );
  }

  get pendencias():
    PendenciaFuncionario[] {

    const itens:
      PendenciaFuncionario[] = [];

    this.adicionarPendenciaPonto(
      itens
    );

    const solicitacoesPendentes =
      this.solicitacoes
        .filter(
          (
            solicitacao:
              SolicitacaoResponse
          ): boolean =>
            solicitacao.status ===
            'PENDENTE'
        )
        .sort(
          (
            a: SolicitacaoResponse,
            b: SolicitacaoResponse
          ): number =>
            b.criadoEm.localeCompare(
              a.criadoEm
            )
        )
        .slice(0, 2);

    solicitacoesPendentes.forEach(
      (
        solicitacao:
          SolicitacaoResponse
      ): void => {
        itens.push({
          id:
            `solicitacao-${solicitacao.id}`,
          titulo:
            `${this.nomeTipoSolicitacao(
              solicitacao.tipo
            )} em análise`,
          descricao:
            `${solicitacao.protocolo} aguarda uma decisão do RH.`,
          data:
            this.formatarDataHora(
              solicitacao.criadoEm
            ),
          tipo: 'info',
          icone:
            'bi-hourglass-split',
          rota: '/solicitacao',
        });
      }
    );

    const idsLidos =
      this.carregarIdsAvisosLidos();

    const avisosNaoLidos =
      this.avisos
        .filter(
          (
            aviso: AvisoResponse
          ): boolean =>
            !idsLidos.has(aviso.id)
        )
        .slice(0, 2);

    avisosNaoLidos.forEach(
      (aviso: AvisoResponse): void => {
        itens.push({
          id: `aviso-${aviso.id}`,
          titulo: aviso.titulo,
          descricao:
            this.resumirTexto(
              aviso.mensagem,
              130
            ),
          data:
            this.formatarDataHora(
              aviso.publicadoEm
            ),
          tipo:
            this.tipoAlertaAviso(
              aviso.nivel
            ),
          icone:
            this.iconeAviso(
              aviso.nivel
            ),
          rota: '/avisos',
        });
      }
    );

    if (itens.length === 0) {
      itens.push({
        id: 'sem-pendencias',
        titulo: 'Tudo em dia',
        descricao:
          'Não há pendências ou avisos novos para você.',
        data: 'Atualizado agora',
        tipo: 'success',
        icone: 'bi-check-circle',
        rota: '/avisos',
      });
    }

    return itens.slice(0, 4);
  }

  carregarInicio(): void {
    this.carregando = true;
    this.erro = '';

    forkJoin({
      perfil:
        this.funcionarioService
          .buscarMeuPerfil(),

      pontoHoje:
        this.pontoService
          .buscarHoje(),

      historico:
        this.pontoService
          .buscarMeuHistorico(),

      solicitacoes:
        this.solicitacaoService
          .listarMinhas(),

      avisos:
        this.avisoService
          .listarMeus(),
    })
      .pipe(timeout(10000))
      .subscribe({
        next: (
          resultado: ResultadoInicio
        ) => {
          this.perfil =
            resultado.perfil;

          this.pontoHoje =
            resultado.pontoHoje;

          this.historico =
            resultado.historico;

          this.solicitacoes =
            resultado.solicitacoes;

          this.avisos =
            resultado.avisos;

          this.carregando = false;
          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao carregar página inicial:',
            erro
          );

          this.erro =
            this.obterMensagemErro(
              erro,
              'Não foi possível carregar a página inicial.'
            );

          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  porcentagemSemana(
    item: MetaSemanal
  ): number {
    if (!item.meta) {
      return 0;
    }

    return Math.min(
      Math.round(
        (item.horas / item.meta) *
        100
      ),
      100
    );
  }

  horasFormatadas(
    horas: number
  ): string {
    return this.formatarMinutos(
      Math.round(horas * 60)
    );
  }

  detalheMeta(
    item: MetaSemanal
  ): string {
    return (
      `${item.dia}: ` +
      `${this.formatarMinutos(
        item.minutos
      )} registradas de ` +
      `${this.horasFormatadas(
        item.meta
      )} previstas.`
    );
  }

  classeStatus(
    status: StatusRegistroDia
  ): string {
    const classes: Record<
      StatusRegistroDia,
      string
    > = {
      Registrado:
        'text-bg-success',

      Pendente:
        'text-bg-warning',

      Previsto:
        'text-bg-light border text-body',

      Indisponível:
        'text-bg-secondary',
    };

    return classes[status];
  }

  classeAlerta(
    tipo:
      PendenciaFuncionario['tipo']
  ): string {
    const classes: Record<
      PendenciaFuncionario['tipo'],
      string
    > = {
      warning:
        'inicio-alerta-warning',

      danger:
        'inicio-alerta-danger',

      info:
        'inicio-alerta-info',

      success:
        'inicio-alerta-success',
    };

    return classes[tipo];
  }

  trackByResumo(
    _index: number,
    item: CardResumoFuncionario
  ): string {
    return item.titulo;
  }

  trackByAcao(
    _index: number,
    item: AcaoRapida
  ): string {
    return item.rota;
  }

  trackByRegistro(
    _index: number,
    item: RegistroDia
  ): TipoMarcacao {
    return item.tipoMarcacao;
  }

  trackByMeta(
    _index: number,
    item: MetaSemanal
  ): string {
    return item.dataISO;
  }

  trackByPendencia(
    _index: number,
    item: PendenciaFuncionario
  ): string {
    return item.id;
  }

  private adicionarPendenciaPonto(
    itens: PendenciaFuncionario[]
  ): void {
    if (!this.pontoHoje) {
      itens.push({
        id: 'ponto-entrada',
        titulo:
          'Entrada ainda não registrada',
        descricao:
          'Registre sua entrada para iniciar a jornada de hoje.',
        data: 'Hoje',
        tipo: 'warning',
        icone:
          'bi-box-arrow-in-right',
        rota: '/meus-pontos',
      });

      return;
    }

    if (
      this.pontoHoje.status ===
      'PENDENTE'
    ) {
      itens.push({
        id: 'ponto-pendente',
        titulo:
          'Ponto pendente de correção',
        descricao:
          'Envie uma solicitação para regularizar a jornada.',
        data: 'Hoje',
        tipo: 'danger',
        icone:
          'bi-exclamation-octagon',
        rota: '/solicitacao',
      });

      return;
    }

    if (
      this.pontoHoje.status ===
      'FALTA'
    ) {
      itens.push({
        id: 'ponto-falta',
        titulo:
          'Falta aguardando justificativa',
        descricao:
          'Envie a justificativa dentro do prazo permitido.',
        data: 'Hoje',
        tipo: 'danger',
        icone: 'bi-calendar-x',
        rota: '/solicitacao',
      });

      return;
    }

    if (this.proximaMarcacao) {
      itens.push({
        id:
          `ponto-${this.proximaMarcacao}`,
        titulo: this.proximaAcao,
        descricao:
          'A próxima marcação da jornada está disponível.',
        data: 'Hoje',
        tipo: 'warning',
        icone: 'bi-clock',
        rota: '/meus-pontos',
      });
    }
  }

  private obterHorarioMarcacao(
    tipo: TipoMarcacao
  ): string | null {
    if (!this.pontoHoje) {
      return null;
    }

    const horarios: Record<
      TipoMarcacao,
      string | null
    > = {
      ENTRADA:
        this.pontoHoje.entrada,

      INICIO_INTERVALO:
        this.pontoHoje
          .inicioIntervalo,

      FIM_INTERVALO:
        this.pontoHoje
          .fimIntervalo,

      SAIDA:
        this.pontoHoje.saida,
    };

    return horarios[tipo];
  }

  private calcularMinutosRegistro(
    registro:
      RegistroPontoResponse | null
  ): number {
    if (!registro?.entrada) {
      return 0;
    }

    if (
      registro.saida &&
      registro.totalTrabalhadoMinutos >=
        0
    ) {
      return registro
        .totalTrabalhadoMinutos;
    }

    const hoje =
      this.formatarDataISO(
        new Date()
      );

    if (
      registro.dataRegistro !== hoje
    ) {
      return registro
        .totalTrabalhadoMinutos ?? 0;
    }

    const agora = new Date();
    const minutosAgora =
      agora.getHours() * 60 +
      agora.getMinutes();

    const entrada =
      this.horaParaMinutos(
        registro.entrada
      );

    if (
      registro.inicioIntervalo &&
      !registro.fimIntervalo
    ) {
      return Math.max(
        0,
        this.horaParaMinutos(
          registro.inicioIntervalo
        ) - entrada
      );
    }

    if (
      registro.inicioIntervalo &&
      registro.fimIntervalo
    ) {
      const antesIntervalo =
        Math.max(
          0,
          this.horaParaMinutos(
            registro.inicioIntervalo
          ) - entrada
        );

      const depoisIntervalo =
        Math.max(
          0,
          minutosAgora -
          this.horaParaMinutos(
            registro.fimIntervalo
          )
        );

      return (
        antesIntervalo +
        depoisIntervalo
      );
    }

    return Math.max(
      0,
      minutosAgora - entrada
    );
  }

  private horaParaMinutos(
    horario: string
  ): number {
    const partes =
      horario.split(':');

    const horas =
      Number(partes[0] ?? 0);

    const minutos =
      Number(partes[1] ?? 0);

    return horas * 60 + minutos;
  }

  private obterInicioSemana():
    Date {

    const hoje = new Date();
    const diaSemana =
      hoje.getDay();

    const diferencaSegunda =
      diaSemana === 0
        ? -6
        : 1 - diaSemana;

    const segunda =
      new Date(hoje);

    segunda.setHours(0, 0, 0, 0);

    segunda.setDate(
      hoje.getDate() +
      diferencaSegunda
    );

    return segunda;
  }

  private nomeDiaSemana(
    data: Date
  ): string {
    const nomes = [
      'Dom',
      'Seg',
      'Ter',
      'Qua',
      'Qui',
      'Sex',
      'Sáb',
    ];

    return nomes[data.getDay()];
  }

  private formatarDataISO(
    data: Date
  ): string {
    const ano =
      data.getFullYear();

    const mes =
      String(
        data.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        data.getDate()
      ).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
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
    const minutosSeguros =
      Math.max(
        0,
        Math.round(totalMinutos)
      );

    const horas =
      Math.floor(
        minutosSeguros / 60
      );

    const minutos =
      minutosSeguros % 60;

    return (
      `${String(horas).padStart(
        2,
        '0'
      )}h` +
      `${String(minutos).padStart(
        2,
        '0'
      )}`
    );
  }

  private nomeTipoSolicitacao(
    tipo: TipoSolicitacao
  ): string {
    const nomes: Record<
      TipoSolicitacao,
      string
    > = {
      CORRECAO_PONTO:
        'Correção de ponto',

      JUSTIFICATIVA_FALTA:
        'Justificativa de falta',

      SOLICITACAO_FERIAS:
        'Solicitação de férias',

      CORRECAO_CADASTRO:
        'Correção cadastral',
    };

    return nomes[tipo];
  }

  private tipoAlertaAviso(
    nivel: NivelAviso
  ): PendenciaFuncionario['tipo'] {
    const tipos: Record<
      NivelAviso,
      PendenciaFuncionario['tipo']
    > = {
      INFORMATIVO: 'info',
      SUCESSO: 'success',
      ALERTA: 'warning',
      URGENTE: 'danger',
    };

    return tipos[nivel];
  }

  private iconeAviso(
    nivel: NivelAviso
  ): string {
    const icones: Record<
      NivelAviso,
      string
    > = {
      INFORMATIVO:
        'bi-info-circle',

      SUCESSO:
        'bi-check-circle',

      ALERTA:
        'bi-exclamation-triangle',

      URGENTE:
        'bi-exclamation-octagon',
    };

    return icones[nivel];
  }

  private carregarIdsAvisosLidos():
    Set<number> {

    if (!this.perfil) {
      return new Set<number>();
    }

    const chave =
      `avisosLidos:${this.perfil.id}`;

    const valor =
      localStorage.getItem(chave);

    if (!valor) {
      return new Set<number>();
    }

    try {
      const ids =
        JSON.parse(valor) as unknown;

      if (!Array.isArray(ids)) {
        return new Set<number>();
      }

      return new Set<number>(
        ids.filter(
          (
            id: unknown
          ): id is number =>
            typeof id === 'number'
        )
      );
    } catch {
      localStorage.removeItem(chave);
      return new Set<number>();
    }
  }

  private formatarDataHora(
    valor: string
  ): string {
    const data =
      new Date(valor);

    return data.toLocaleString(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      }
    );
  }

  private resumirTexto(
    texto: string,
    limite: number
  ): string {
    const valor =
      texto.trim();

    if (valor.length <= limite) {
      return valor;
    }

    return (
      valor.substring(
        0,
        limite - 1
      ).trimEnd() +
      '…'
    );
  }

  private obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string
  ): string {
    if (
      erro instanceof
      HttpErrorResponse
    ) {
      if (erro.status === 0) {
        return (
          'Não foi possível conectar ' +
          'ao servidor.'
        );
      }

      if (
        typeof erro.error?.mensagem ===
        'string'
      ) {
        return erro.error.mensagem;
      }

      if (
        typeof erro.error?.message ===
        'string'
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
      return (
        'O servidor demorou muito ' +
        'para responder.'
      );
    }

    return mensagemPadrao;
  }
}