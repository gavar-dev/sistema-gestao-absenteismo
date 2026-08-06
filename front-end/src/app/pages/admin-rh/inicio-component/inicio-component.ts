import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, timeout } from 'rxjs';

import { FuncionarioService } from '../../../core/services/funcionario';
import { PontoService } from '../../../core/services/ponto.service';
import { SolicitacaoService } from '../../../core/services/solicitacao';

import { FuncionarioResponse } from '../../../models/funcionario';
import {
  IndicadorSetorResponse,
  RegistroPontoResponse,
  ResumoPontoResponse,
  StatusJornada,
} from '../../../models/ponto';
import {
  SolicitacaoResponse,
  StatusSolicitacao,
  TipoSolicitacao,
} from '../../../models/solicitacao';

interface IndicadorGestao {
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
  variacao: string;
  tipo:
    | 'positivo'
    | 'atencao'
    | 'neutro'
    | 'perigo';
}

interface StatusFuncionarioVisual {
  nome: string;
  quantidade: number;
  percentual: number;
  classe: string;
  cor: string;
}

interface IndicadorSetorVisual {
  nome: string;
  funcionarios: number;
  atrasos: number;
  faltas: number;
  pendencias: number;
  ocorrencias: number;
  percentual: number;
}

interface FuncionarioCritico {
  id: number;
  nome: string;
  setor: string;
  atrasos: number;
  faltas: number;
  pendencias: number;
  status: 'Acompanhar' | 'Crítico';
  pontuacao: number;
}

type StatusSolicitacaoVisual =
  | 'Pendente'
  | 'Aprovada'
  | 'Rejeitada';

interface SolicitacaoRecente {
  id: number;
  funcionario: string;
  tipo: string;
  data: string;
  status: StatusSolicitacaoVisual;
}

interface AlertaGestao {
  titulo: string;
  descricao: string;
  icone: string;
  tipo:
    | 'warning'
    | 'danger'
    | 'info';
  rota: string;
}

interface ResumoHoje {
  label: string;
  valor: number;
  total: number;
}

interface ResultadoPainel {
  funcionarios: FuncionarioResponse[];
  registrosHoje: RegistroPontoResponse[];
  registrosMes: RegistroPontoResponse[];
  resumoMes: ResumoPontoResponse;
  setores: IndicadorSetorResponse[];
  solicitacoes: SolicitacaoResponse[];
}

@Component({
  selector: 'app-inicio-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './inicio-component.html',
  styleUrl: './inicio-component.css',
})
export class InicioComponent
  implements OnInit {

  funcionarios: FuncionarioResponse[] = [];
  registrosHoje: RegistroPontoResponse[] = [];
  registrosMes: RegistroPontoResponse[] = [];
  resumoMes: ResumoPontoResponse =
    this.criarResumoVazio();
  setoresApi: IndicadorSetorResponse[] = [];
  solicitacoes: SolicitacaoResponse[] = [];

  carregando = true;
  erro = '';

  readonly inicioMes =
    this.obterPrimeiroDiaMes();

  readonly hoje =
    this.formatarDataISO(
      new Date()
    );

  constructor(
    private readonly funcionarioService:
      FuncionarioService,

    private readonly pontoService:
      PontoService,

    private readonly solicitacaoService:
      SolicitacaoService,

    private readonly cdr:
      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPainel();
  }

  get funcionariosAtivos(): number {
    return this.funcionarios.filter(
      (
        funcionario:
          FuncionarioResponse
      ): boolean =>
        this.normalizarTexto(
          funcionario.status
        ) === 'ativo'
    ).length;
  }

  get presentesHoje(): number {
    return this.registrosHoje.filter(
      (
        registro:
          RegistroPontoResponse
      ): boolean =>
        registro.entrada !== null &&
        registro.status !== 'FALTA'
    ).length;
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

  get indicadores(): IndicadorGestao[] {
    const percentualPresentes =
      this.porcentagem(
        this.presentesHoje,
        this.funcionariosAtivos
      );

    return [
      {
        titulo:
          'Funcionários cadastrados',
        valor:
          String(this.funcionarios.length),
        descricao:
          `${this.funcionariosAtivos} ativos no momento`,
        icone:
          'bi-people-fill',
        variacao:
          `${this.statusQuantidade(
            'Férias'
          )} em férias`,
        tipo: 'neutro',
      },
      {
        titulo: 'Presentes hoje',
        valor:
          String(this.presentesHoje),
        descricao:
          `${percentualPresentes}% da base ativa`,
        icone:
          'bi-person-check-fill',
        variacao:
          `${this.registrosHoje.length} registros`,
        tipo:
          percentualPresentes >= 80
            ? 'positivo'
            : 'atencao',
      },
      {
        titulo: 'Atrasos no mês',
        valor:
          String(
            this.resumoMes
              .quantidadeAtrasos
          ),
        descricao:
          this.resumoMes
            .quantidadeAtrasos > 0
            ? `Média de ${Math.round(
                this.resumoMes
                  .mediaMinutosAtraso
              )} min`
            : 'Nenhum atraso registrado',
        icone:
          'bi-alarm-fill',
        variacao:
          `${this.resumoMes.totalMinutosAtraso} min acumulados`,
        tipo:
          this.resumoMes
            .quantidadeAtrasos > 0
            ? 'atencao'
            : 'positivo',
      },
      {
        titulo: 'Faltas no mês',
        valor:
          String(
            this.resumoMes
              .quantidadeFaltas
          ),
        descricao:
          `${this.resumoMes.quantidadePendencias} ponto(s) pendente(s)`,
        icone:
          'bi-calendar-x-fill',
        variacao:
          this.solicitacoesPendentes > 0
            ? `${this.solicitacoesPendentes} solicitação(ões) pendente(s)`
            : 'Sem solicitações pendentes',
        tipo:
          this.resumoMes
            .quantidadeFaltas > 0
            ? 'perigo'
            : 'positivo',
      },
    ];
  }

  get statusFuncionarios():
    StatusFuncionarioVisual[] {

    const total =
      this.funcionarios.length;

    const configuracoes = [
      {
        nome: 'Ativos',
        valor: 'Ativo',
        classe: 'status-ativos',
        cor: '#198754',
      },
      {
        nome: 'Férias',
        valor: 'Férias',
        classe: 'status-ferias',
        cor: '#ffc107',
      },
      {
        nome: 'Afastados',
        valor: 'Afastado',
        classe: 'status-afastados',
        cor: '#0dcaf0',
      },
      {
        nome: 'Inativos',
        valor: 'Inativo',
        classe: 'status-inativos',
        cor: '#6c757d',
      },
    ];

    return configuracoes.map(
      (
        configuracao: {
          nome: string;
          valor: string;
          classe: string;
          cor: string;
        }
      ): StatusFuncionarioVisual => {

        const quantidade =
          this.statusQuantidade(
            configuracao.valor
          );

        return {
          nome:
            configuracao.nome,
          quantidade,
          percentual:
            this.porcentagem(
              quantidade,
              total
            ),
          classe:
            configuracao.classe,
          cor:
            configuracao.cor,
        };
      }
    );
  }

  get gradienteStatus(): string {
    if (
      this.funcionarios.length === 0
    ) {
      return (
        'conic-gradient(' +
        'var(--bs-secondary-bg) ' +
        '0deg 360deg)'
      );
    }

    let anguloAtual = 0;

    const partes =
      this.statusFuncionarios.map(
        (
          status:
            StatusFuncionarioVisual
        ): string => {

          const angulo =
            (
              status.quantidade /
              this.funcionarios.length
            ) * 360;

          const inicio =
            anguloAtual;

          anguloAtual += angulo;

          return (
            `${status.cor} ` +
            `${inicio}deg ` +
            `${anguloAtual}deg`
          );
        }
      );

    return (
      `conic-gradient(${partes.join(
        ', '
      )})`
    );
  }

  get indicadoresSetor():
    IndicadorSetorVisual[] {

    const itens =
      this.setoresApi.map(
        (
          setor:
            IndicadorSetorResponse
        ): IndicadorSetorVisual => {

          const ocorrencias =
            setor.atrasos +
            setor.faltas +
            setor.pendencias;

          return {
            nome:
              setor.setor ||
              'Sem setor',
            funcionarios:
              this.quantidadeFuncionariosSetor(
                setor.setor
              ),
            atrasos:
              setor.atrasos,
            faltas:
              setor.faltas,
            pendencias:
              setor.pendencias,
            ocorrencias,
            percentual: 0,
          };
        }
      );

    const maiorOcorrencia =
      Math.max(
        0,
        ...itens.map(
          (
            item:
              IndicadorSetorVisual
          ): number =>
            item.ocorrencias
        )
      );

    return itens
      .map(
        (
          item:
            IndicadorSetorVisual
        ): IndicadorSetorVisual => ({
          ...item,
          percentual:
            maiorOcorrencia > 0
              ? this.porcentagem(
                  item.ocorrencias,
                  maiorOcorrencia
                )
              : 0,
        })
      )
      .sort(
        (
          a:
            IndicadorSetorVisual,
          b:
            IndicadorSetorVisual
        ): number =>
          b.ocorrencias -
          a.ocorrencias
      )
      .slice(0, 5);
  }

  get funcionariosCriticos():
    FuncionarioCritico[] {

    const agrupados =
      new Map<number, FuncionarioCritico>();

    this.registrosMes.forEach(
      (
        registro:
          RegistroPontoResponse
      ): void => {

        const atual =
          agrupados.get(
            registro.funcionarioId
          ) ?? {
            id:
              registro.funcionarioId,
            nome:
              registro.nomeFuncionario,
            setor:
              this.setorFuncionario(
                registro.funcionarioId
              ),
            atrasos: 0,
            faltas: 0,
            pendencias: 0,
            status: 'Acompanhar',
            pontuacao: 0,
          };

        if (
          registro.status === 'ATRASO' ||
          registro.atrasoMinutos > 0
        ) {
          atual.atrasos += 1;
        }

        if (
          registro.status === 'FALTA'
        ) {
          atual.faltas += 1;
        }

        if (
          registro.status === 'PENDENTE'
        ) {
          atual.pendencias += 1;
        }

        atual.pontuacao =
          atual.atrasos +
          atual.faltas * 2 +
          atual.pendencias * 1.5;

        atual.status =
          atual.faltas >= 2 ||
          atual.pontuacao >= 4
            ? 'Crítico'
            : 'Acompanhar';

        agrupados.set(
          registro.funcionarioId,
          atual
        );
      }
    );

    return Array.from(
      agrupados.values()
    )
      .filter(
        (
          item:
            FuncionarioCritico
        ): boolean =>
          item.pontuacao > 0
      )
      .sort(
        (
          a:
            FuncionarioCritico,
          b:
            FuncionarioCritico
        ): number =>
          b.pontuacao -
          a.pontuacao
      )
      .slice(0, 5);
  }

  get solicitacoesRecentes():
    SolicitacaoRecente[] {

    return [...this.solicitacoes]
      .sort(
        (
          a: SolicitacaoResponse,
          b: SolicitacaoResponse
        ): number =>
          b.criadoEm.localeCompare(
            a.criadoEm
          )
      )
      .slice(0, 4)
      .map(
        (
          solicitacao:
            SolicitacaoResponse
        ): SolicitacaoRecente => ({
          id: solicitacao.id,
          funcionario:
            solicitacao.nomeFuncionario,
          tipo:
            this.nomeTipoSolicitacao(
              solicitacao.tipo
            ),
          data:
            this.formatarDataHora(
              solicitacao.criadoEm
            ),
          status:
            this.nomeStatusSolicitacao(
              solicitacao.status
            ),
        })
      );
  }

  get alertas(): AlertaGestao[] {
    const alertas:
      AlertaGestao[] = [];

    if (
      this.resumoMes
        .quantidadePendencias > 0
    ) {
      alertas.push({
        titulo:
          'Pendências de ponto',
        descricao:
          `${this.resumoMes.quantidadePendencias} registro(s) precisam de correção no mês.`,
        icone:
          'bi-exclamation-triangle-fill',
        tipo: 'warning',
        rota:
          '/gestao/solicitacoes',
      });
    }

    const setorCritico =
      this.indicadoresSetor[0];

    if (
      setorCritico &&
      setorCritico.ocorrencias > 0
    ) {
      alertas.push({
        titulo:
          'Setor com mais ocorrências',
        descricao:
          `${setorCritico.nome} possui ${setorCritico.ocorrencias} ocorrência(s) no período.`,
        icone:
          'bi-graph-up-arrow',
        tipo: 'danger',
        rota:
          '/gestao/funcionarios',
      });
    }

    if (
      this.solicitacoesPendentes > 0
    ) {
      alertas.push({
        titulo:
          'Solicitações aguardando análise',
        descricao:
          `${this.solicitacoesPendentes} solicitação(ões) estão pendentes.`,
        icone:
          'bi-inbox-fill',
        tipo: 'info',
        rota:
          '/gestao/solicitacoes',
      });
    }

    if (alertas.length === 0) {
      alertas.push({
        titulo:
          'Operação regular',
        descricao:
          'Não há alertas críticos para o período atual.',
        icone:
          'bi-check-circle-fill',
        tipo: 'info',
        rota:
          '/gestao/inicio',
      });
    }

    return alertas.slice(0, 3);
  }

  get resumoHoje():
    ResumoHoje[] {

    const dentroHorario =
      this.registrosHoje.filter(
        (
          registro:
            RegistroPontoResponse
        ): boolean =>
          registro.entrada !== null &&
          registro.atrasoMinutos === 0 &&
          ![
            'FALTA',
            'PENDENTE',
          ].includes(
            registro.status
          )
      ).length;

    const comAtraso =
      this.registrosHoje.filter(
        (
          registro:
            RegistroPontoResponse
        ): boolean =>
          registro.status === 'ATRASO' ||
          registro.atrasoMinutos > 0
      ).length;

    const pendentes =
      this.registrosHoje.filter(
        (
          registro:
            RegistroPontoResponse
        ): boolean =>
          registro.status ===
          'PENDENTE'
      ).length;

    const total =
      this.registrosHoje.length;

    return [
      {
        label:
          'Dentro do horário',
        valor:
          dentroHorario,
        total,
      },
      {
        label:
          'Com atraso',
        valor:
          comAtraso,
        total,
      },
      {
        label:
          'Ponto pendente',
        valor:
          pendentes,
        total,
      },
    ];
  }

  carregarPainel(): void {
    this.carregando = true;
    this.erro = '';

    forkJoin({
      funcionarios:
        this.funcionarioService
          .listar(),

      registrosHoje:
        this.pontoService
          .buscarRegistrosGerenciais(
            this.hoje,
            this.hoje
          ),

      registrosMes:
        this.pontoService
          .buscarRegistrosGerenciais(
            this.inicioMes,
            this.hoje
          ),

      resumoMes:
        this.pontoService
          .buscarResumoGerencial(
            this.inicioMes,
            this.hoje
          ),

      setores:
        this.pontoService
          .buscarIndicadoresPorSetor(
            this.inicioMes,
            this.hoje
          ),

      solicitacoes:
        this.solicitacaoService
          .listarGerencial(),
    })
      .pipe(timeout(10000))
      .subscribe({
        next: (
          resultado:
            ResultadoPainel
        ) => {
          this.funcionarios =
            resultado.funcionarios;

          this.registrosHoje =
            resultado.registrosHoje;

          this.registrosMes =
            resultado.registrosMes;

          this.resumoMes =
            resultado.resumoMes;

          this.setoresApi =
            resultado.setores;

          this.solicitacoes =
            resultado.solicitacoes;

          this.carregando = false;
          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao carregar painel de gestão:',
            erro
          );

          this.erro =
            this.obterMensagemErro(
              erro,
              'Não foi possível carregar o painel de gestão.'
            );

          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  porcentagem(
    valor: number,
    total: number
  ): number {
    if (!total) {
      return 0;
    }

    return Math.round(
      (valor / total) * 100
    );
  }

  totalStatusFuncionarios():
    number {

    return this.statusFuncionarios
      .reduce(
        (
          total: number,
          status:
            StatusFuncionarioVisual
        ): number =>
          total +
          status.quantidade,
        0
      );
  }

  resumoDetalhe(
    item: ResumoHoje
  ): string {
    return (
      `${item.label}: ` +
      `${item.valor} de ${item.total} registros, ` +
      `${this.porcentagem(
        item.valor,
        item.total
      )}% do resumo de hoje.`
    );
  }

  statusDetalhe(
    status:
      StatusFuncionarioVisual
  ): string {
    return (
      `${status.nome}: ` +
      `${status.quantidade} funcionários, ` +
      `${status.percentual}% do total cadastrado.`
    );
  }

  setorDetalhe(
    setor:
      IndicadorSetorVisual
  ): string {
    return (
      `${setor.nome}: ` +
      `${setor.funcionarios} funcionários, ` +
      `${setor.atrasos} atrasos, ` +
      `${setor.faltas} faltas e ` +
      `${setor.pendencias} pendências no mês.`
    );
  }

  statusClasseSolicitacao(
    status:
      StatusSolicitacaoVisual
  ): string {
    const classes: Record<
      StatusSolicitacaoVisual,
      string
    > = {
      Pendente:
        'text-bg-warning',

      Aprovada:
        'text-bg-success',

      Rejeitada:
        'text-bg-danger',
    };

    return classes[status];
  }

  statusClasseFuncionario(
    status:
      FuncionarioCritico['status']
  ): string {
    return status === 'Crítico'
      ? 'text-bg-danger'
      : 'text-bg-warning';
  }

  alertaClasse(
    tipo:
      AlertaGestao['tipo']
  ): string {
    const classes: Record<
      AlertaGestao['tipo'],
      string
    > = {
      warning:
        'alerta-warning',

      danger:
        'alerta-danger',

      info:
        'alerta-info',
    };

    return classes[tipo];
  }

  trackByIndicador(
    _index: number,
    item: IndicadorGestao
  ): string {
    return item.titulo;
  }

  trackByStatus(
    _index: number,
    item:
      StatusFuncionarioVisual
  ): string {
    return item.nome;
  }

  trackBySetor(
    _index: number,
    item:
      IndicadorSetorVisual
  ): string {
    return item.nome;
  }

  trackByFuncionario(
    _index: number,
    item:
      FuncionarioCritico
  ): number {
    return item.id;
  }

  trackBySolicitacao(
    _index: number,
    item:
      SolicitacaoRecente
  ): number {
    return item.id;
  }

  trackByAlerta(
    _index: number,
    item: AlertaGestao
  ): string {
    return item.titulo;
  }

  private statusQuantidade(
    status: string
  ): number {
    const statusNormalizado =
      this.normalizarTexto(status);

    return this.funcionarios.filter(
      (
        funcionario:
          FuncionarioResponse
      ): boolean =>
        this.normalizarTexto(
          funcionario.status
        ) === statusNormalizado
    ).length;
  }

  private quantidadeFuncionariosSetor(
    setor: string
  ): number {
    const setorNormalizado =
      this.normalizarTexto(
        setor || 'sem setor'
      );

    return this.funcionarios.filter(
      (
        funcionario:
          FuncionarioResponse
      ): boolean =>
        this.normalizarTexto(
          funcionario.setor ||
          'sem setor'
        ) === setorNormalizado
    ).length;
  }

  private setorFuncionario(
    funcionarioId: number
  ): string {
    return (
      this.funcionarios.find(
        (
          funcionario:
            FuncionarioResponse
        ): boolean =>
          funcionario.id ===
          funcionarioId
      )?.setor ??
      'Não informado'
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

  private nomeStatusSolicitacao(
    status: StatusSolicitacao
  ): StatusSolicitacaoVisual {
    const nomes: Record<
      StatusSolicitacao,
      StatusSolicitacaoVisual
    > = {
      PENDENTE:
        'Pendente',

      APROVADA:
        'Aprovada',

      REJEITADA:
        'Rejeitada',
    };

    return nomes[status];
  }

  private formatarDataHora(
    valor: string
  ): string {
    return new Date(
      valor
    ).toLocaleString(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      }
    );
  }

  private obterPrimeiroDiaMes():
    string {

    const agora =
      new Date();

    const primeiroDia =
      new Date(
        agora.getFullYear(),
        agora.getMonth(),
        1
      );

    return this.formatarDataISO(
      primeiroDia
    );
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

  private criarResumoVazio():
    ResumoPontoResponse {

    return {
      totalRegistros: 0,
      jornadasFinalizadas: 0,
      jornadasEmAndamento: 0,
      quantidadeAtrasos: 0,
      quantidadeFaltas: 0,
      quantidadePendencias: 0,
      totalMinutosAtraso: 0,
      mediaMinutosAtraso: 0,
      totalMinutosTrabalhados: 0,
    };
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