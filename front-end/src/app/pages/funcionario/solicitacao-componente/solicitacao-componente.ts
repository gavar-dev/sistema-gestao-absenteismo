import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { timeout, TimeoutError } from 'rxjs';

import { SolicitacaoService } from '../../../core/services/solicitacao';
import {
  PrioridadeSolicitacao as PrioridadeSolicitacaoApi,
  SolicitacaoCreateRequest,
  SolicitacaoResponse,
  StatusSolicitacao as StatusSolicitacaoApi,
  TipoSolicitacao as TipoSolicitacaoApi,
} from '../../../models/solicitacao';

interface TipoSolicitacaoCard {
  titulo: TipoSolicitacaoNome;
  descricao: string;
  icone: string;
  tipo: 'neutro' | 'atencao' | 'positivo' | 'perigo';
}

type TipoSolicitacaoNome =
  | 'Correção de ponto'
  | 'Justificativa de falta'
  | 'Solicitação de férias'
  | 'Correção de cadastro';

type StatusSolicitacaoNome = 'Pendente' | 'Aprovada' | 'Rejeitada';
type PrioridadeSolicitacaoNome = 'Normal' | 'Alta';

interface CampoCadastroOpcao {
  valor: string;
  label: string;
}

interface SolicitacaoRecente {
  id: number;
  codigo: string;
  tipo: TipoSolicitacaoNome;
  data: string;
  status: StatusSolicitacaoNome;
  prioridade: PrioridadeSolicitacaoNome;
  referencia: string;
  descricao: string;
  horarios?: string;
  campoCadastro?: string;
  novoValor?: string;
  anexo?: string;
  observacaoAnalise?: string;
  analisadoPor?: string;
  dataAnalise?: string;
}

interface FormularioSolicitacao {
  tipo: TipoSolicitacaoNome;
  prioridade: PrioridadeSolicitacaoNome;

  dataRelacionada: string;

  entradaSolicitada: string;
  inicioIntervaloSolicitado: string;
  fimIntervaloSolicitado: string;
  saidaSolicitada: string;

  dataInicio: string;
  dataFim: string;

  campoCadastro: string;
  novoValor: string;

  descricao: string;
  anexo: string;
}

@Component({
  selector: 'app-solicitacao-componente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacao-componente.html',
  styleUrl: './solicitacao-componente.css',
})
export class SolicitacaoComponente implements OnInit {
  @ViewChild('inputAnexo')
  inputAnexo?: ElementRef<HTMLInputElement>;

  readonly dataHoje = new Intl.DateTimeFormat('en-CA').format(new Date());

  mensagemSucesso = '';
  erroEnvio = '';
  erroHistorico = '';

  carregandoHistorico = true;
  enviandoSolicitacao = false;

  solicitacaoSelecionada: SolicitacaoRecente | null = null;
  anexoSelecionado: File | null = null;

  readonly tipos: TipoSolicitacaoCard[] = [
    {
      titulo: 'Correção de ponto',
      descricao: 'Entrada, almoço, retorno ou saída não registrada.',
      icone: 'bi-clock-history',
      tipo: 'neutro',
    },
    {
      titulo: 'Justificativa de falta',
      descricao: 'Envie o motivo da ausência e o comprovante disponível.',
      icone: 'bi-calendar-x',
      tipo: 'perigo',
    },
    {
      titulo: 'Solicitação de férias',
      descricao: 'Informe o período desejado para avaliação do setor.',
      icone: 'bi-suitcase-lg',
      tipo: 'positivo',
    },
    {
      titulo: 'Correção de cadastro',
      descricao: 'Atualize telefone, e-mail ou outros dados permitidos.',
      icone: 'bi-person-lines-fill',
      tipo: 'atencao',
    },
  ];

  readonly camposCadastro: CampoCadastroOpcao[] = [
    { valor: 'nome', label: 'Nome completo' },
    { valor: 'email', label: 'E-mail corporativo' },
    { valor: 'cpf', label: 'CPF' },
    { valor: 'telefone', label: 'Telefone' },
    { valor: 'data de nascimento', label: 'Data de nascimento' },
    { valor: 'estado civil', label: 'Estado civil' },
    { valor: 'nacionalidade', label: 'Nacionalidade' },
    { valor: 'naturalidade', label: 'Naturalidade' },
    { valor: 'local de trabalho', label: 'Local de trabalho' },
  ];

  readonly regras = [
    'Correções de ponto podem ser solicitadas em até <strong>48 horas</strong>.',
    'Informe ao menos um horário em pedidos de correção de ponto.',
    'Justificativas de falta exigem uma falta ou pendência registrada na data.',
    'Pedidos de férias dependem da disponibilidade do setor e da aprovação da gestão.',
  ];

  historico: SolicitacaoRecente[] = [];
  formulario: FormularioSolicitacao = this.criarFormularioInicial();

  constructor(
    private readonly solicitacaoService: SolicitacaoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarHistorico();
  }

  get ehCorrecaoPonto(): boolean {
    return this.formulario.tipo === 'Correção de ponto';
  }

  get ehJustificativaFalta(): boolean {
    return this.formulario.tipo === 'Justificativa de falta';
  }

  get ehSolicitacaoFerias(): boolean {
    return this.formulario.tipo === 'Solicitação de férias';
  }

  get ehCorrecaoCadastro(): boolean {
    return this.formulario.tipo === 'Correção de cadastro';
  }

  get permiteAnexo(): boolean {
    return this.ehCorrecaoPonto || this.ehJustificativaFalta;
  }

  get tipoInputNovoValor(): string {
    switch (this.formulario.campoCadastro) {
      case 'email':
        return 'email';
      case 'telefone':
        return 'tel';
      case 'data de nascimento':
        return 'date';
      default:
        return 'text';
    }
  }

  get placeholderNovoValor(): string {
    switch (this.formulario.campoCadastro) {
      case 'nome':
        return 'Informe o nome completo';
      case 'email':
        return 'nome@empresa.com';
      case 'cpf':
        return '000.000.000-00';
      case 'telefone':
        return '(21) 99999-9999';
      case 'estado civil':
        return 'Exemplo: Solteiro(a)';
      case 'nacionalidade':
        return 'Exemplo: Brasileira';
      case 'naturalidade':
        return 'Exemplo: Rio de Janeiro - RJ';
      case 'local de trabalho':
        return 'Informe o local de trabalho';
      default:
        return 'Informe o novo valor';
    }
  }

  get totalPendentes(): number {
    return this.historico.filter((item) => item.status === 'Pendente').length;
  }

  get totalResolvidas(): number {
    return this.historico.filter((item) => item.status !== 'Pendente').length;
  }

  carregarHistorico(): void {
    this.carregandoHistorico = true;
    this.erroHistorico = '';

    this.solicitacaoService
      .listarMinhas()
      .pipe(timeout(10000))
      .subscribe({
        next: (solicitacoes) => {
          this.historico = solicitacoes.map((item) =>
            this.converterSolicitacao(item)
          );

          this.carregandoHistorico = false;
          this.cdr.detectChanges();
        },
        error: (erro: unknown) => {
          console.error('Erro ao carregar solicitações:', erro);

          this.erroHistorico = this.obterMensagemErro(
            erro,
            'Não foi possível carregar suas solicitações.'
          );

          this.carregandoHistorico = false;
          this.cdr.detectChanges();
        },
      });
  }

  selecionarTipo(tipo: TipoSolicitacaoNome): void {
    this.alterarTipo(tipo);

    setTimeout(() => {
      document
        .getElementById('formulario-solicitacao')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  alterarTipo(tipo: TipoSolicitacaoNome): void {
    this.formulario.tipo = tipo;
    this.limparCamposEspecificos();
    this.mensagemSucesso = '';
    this.erroEnvio = '';
  }

  selecionarAnexo(
    evento: Event
  ): void {

    const input =
      evento.target as HTMLInputElement;

    const arquivo =
      input.files?.[0] ?? null;

    this.erroEnvio = '';
    this.anexoSelecionado = null;
    this.formulario.anexo = '';

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (
      !tiposPermitidos.includes(
        arquivo.type
      )
    ) {
      this.erroEnvio =
        'Formato não permitido. Envie PDF, JPG ou PNG.';

      input.value = '';
      return;
    }

    const tamanhoMaximo =
      5 * 1024 * 1024;

    if (
      arquivo.size >
      tamanhoMaximo
    ) {
      this.erroEnvio =
        'O anexo deve possuir no máximo 5 MB.';

      input.value = '';
      return;
    }

    this.anexoSelecionado =
      arquivo;

    this.formulario.anexo =
      arquivo.name;
  }

  criarSolicitacao(form: NgForm): void {
    if (this.enviandoSolicitacao) {
      return;
    }

    this.mensagemSucesso = '';
    this.erroEnvio = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.erroEnvio = 'Preencha corretamente os campos obrigatórios.';
      return;
    }

    const erroValidacao = this.validarCamposEspecificos();

    if (erroValidacao) {
      this.erroEnvio = erroValidacao;
      return;
    }

    const request = this.montarRequest();

    this.enviandoSolicitacao = true;

   this.solicitacaoService
    .criar(request,this.anexoSelecionado)
    .pipe(timeout(10000))
    .subscribe({
      next: (resposta) => {
        const novaSolicitacao = this.converterSolicitacao(resposta);

        this.historico = [
          novaSolicitacao,
          ...this.historico.filter((item) => item.id !== novaSolicitacao.id),
        ];

        this.mensagemSucesso = `${resposta.protocolo} foi enviada para análise do RH.`;
        this.enviandoSolicitacao = false;

        this.formulario = this.criarFormularioInicial();
        form.resetForm(this.formulario);
        this.limparInputAnexo();

        this.cdr.detectChanges();
      },
      error: (erro: unknown) => {
        console.error('Erro ao criar solicitação:', erro);

        this.erroEnvio = this.obterMensagemErro(
          erro,
          'Não foi possível enviar a solicitação.'
        );

        this.enviandoSolicitacao = false;
        this.cdr.detectChanges();
      },
    });
  }

  limparFormulario(form?: NgForm): void {
    this.formulario = this.criarFormularioInicial();
    this.mensagemSucesso = '';
    this.erroEnvio = '';

    if (form) {
      form.resetForm(this.formulario);
    }

    this.limparInputAnexo();
  }

  abrirDetalhes(item: SolicitacaoRecente): void {
    this.solicitacaoSelecionada = item;
  }

  fecharDetalhes(): void {
    this.solicitacaoSelecionada = null;
  }

  classeStatus(status: StatusSolicitacaoNome): string {
    const classes: Record<StatusSolicitacaoNome, string> = {
      Pendente: 'text-bg-warning',
      Aprovada: 'text-bg-success',
      Rejeitada: 'text-bg-danger',
    };

    return classes[status];
  }

  trackById(_index: number, item: SolicitacaoRecente): number {
    return item.id;
  }

  private validarCamposEspecificos(): string {
    if (this.formulario.descricao.trim().length < 10) {
      return 'A descrição deve possuir pelo menos 10 caracteres.';
    }

    if (this.ehCorrecaoPonto) {
      if (!this.formulario.dataRelacionada) {
        return 'Informe a data relacionada à correção de ponto.';
      }

      const possuiHorario = [
        this.formulario.entradaSolicitada,
        this.formulario.inicioIntervaloSolicitado,
        this.formulario.fimIntervaloSolicitado,
        this.formulario.saidaSolicitada,
      ].some(Boolean);

      if (!possuiHorario) {
        return 'Informe ao menos um horário para a correção de ponto.';
      }
    }

    if (this.ehJustificativaFalta && !this.formulario.dataRelacionada) {
      return 'Informe a data da falta ou pendência.';
    }

    if (this.ehSolicitacaoFerias) {
      if (!this.formulario.dataInicio || !this.formulario.dataFim) {
        return 'Informe as datas inicial e final das férias.';
      }

      if (this.formulario.dataFim < this.formulario.dataInicio) {
        return 'A data final das férias não pode ser anterior à data inicial.';
      }
    }

    if (this.ehCorrecaoCadastro) {
      if (!this.formulario.campoCadastro) {
        return 'Selecione o campo cadastral que será alterado.';
      }

      if (!this.formulario.novoValor.trim()) {
        return 'Informe o novo valor do campo cadastral.';
      }
    }

    return '';
  }

  private montarRequest(): SolicitacaoCreateRequest {
    const request: SolicitacaoCreateRequest = {
      tipo: this.converterTipoParaApi(this.formulario.tipo),
      prioridade: this.converterPrioridadeParaApi(this.formulario.prioridade),
      justificativa: this.formulario.descricao.trim(),
    };

    if (this.ehCorrecaoPonto) {
      request.dataReferencia = this.formulario.dataRelacionada;
      request.entradaSolicitada = this.valorOuUndefined(
        this.formulario.entradaSolicitada
      );
      request.inicioIntervaloSolicitado = this.valorOuUndefined(
        this.formulario.inicioIntervaloSolicitado
      );
      request.fimIntervaloSolicitado = this.valorOuUndefined(
        this.formulario.fimIntervaloSolicitado
      );
      request.saidaSolicitada = this.valorOuUndefined(
        this.formulario.saidaSolicitada
      );
      
    }

    if (this.ehJustificativaFalta) {
      request.dataReferencia = this.formulario.dataRelacionada;
      
    }

    if (this.ehSolicitacaoFerias) {
      request.dataInicio = this.formulario.dataInicio;
      request.dataFim = this.formulario.dataFim;
    }

    if (this.ehCorrecaoCadastro) {
      request.campoCadastro = this.formulario.campoCadastro;
      request.novoValor = this.formulario.novoValor.trim();
    }

    return request;
  }

  private converterSolicitacao(
    solicitacao: SolicitacaoResponse
  ): SolicitacaoRecente {
    return {
      id: solicitacao.id,
      codigo: solicitacao.protocolo,
      tipo: this.converterTipoDaApi(solicitacao.tipo),
      data: this.formatarDataHora(solicitacao.criadoEm),
      status: this.converterStatusDaApi(solicitacao.status),
      prioridade: this.converterPrioridadeDaApi(solicitacao.prioridade),
      referencia: this.obterReferencia(solicitacao),
      descricao: solicitacao.justificativa,
      horarios: this.obterHorarios(solicitacao),
      campoCadastro: solicitacao.campoCadastro
        ? this.obterLabelCampo(solicitacao.campoCadastro)
        : undefined,
      novoValor: solicitacao.novoValor ?? undefined,
      anexo: solicitacao.nomeAnexo ?? undefined,
      observacaoAnalise: solicitacao.observacaoAnalise ?? undefined,
      analisadoPor: solicitacao.nomeAnalisadoPor ?? undefined,
      dataAnalise: solicitacao.analisadoEm
        ? this.formatarDataHora(solicitacao.analisadoEm)
        : undefined,
    };
  }

  private converterTipoParaApi(tipo: TipoSolicitacaoNome): TipoSolicitacaoApi {
    const tipos: Record<TipoSolicitacaoNome, TipoSolicitacaoApi> = {
      'Correção de ponto': 'CORRECAO_PONTO',
      'Justificativa de falta': 'JUSTIFICATIVA_FALTA',
      'Solicitação de férias': 'SOLICITACAO_FERIAS',
      'Correção de cadastro': 'CORRECAO_CADASTRO',
    };

    return tipos[tipo];
  }

  private converterTipoDaApi(tipo: TipoSolicitacaoApi): TipoSolicitacaoNome {
    const tipos: Record<TipoSolicitacaoApi, TipoSolicitacaoNome> = {
      CORRECAO_PONTO: 'Correção de ponto',
      JUSTIFICATIVA_FALTA: 'Justificativa de falta',
      SOLICITACAO_FERIAS: 'Solicitação de férias',
      CORRECAO_CADASTRO: 'Correção de cadastro',
    };

    return tipos[tipo];
  }

  private converterStatusDaApi(
    status: StatusSolicitacaoApi
  ): StatusSolicitacaoNome {
    const statusMap: Record<StatusSolicitacaoApi, StatusSolicitacaoNome> = {
      PENDENTE: 'Pendente',
      APROVADA: 'Aprovada',
      REJEITADA: 'Rejeitada',
    };

    return statusMap[status];
  }

  private converterPrioridadeParaApi(
    prioridade: PrioridadeSolicitacaoNome
  ): PrioridadeSolicitacaoApi {
    return prioridade === 'Alta' ? 'ALTA' : 'NORMAL';
  }

  private converterPrioridadeDaApi(
    prioridade: PrioridadeSolicitacaoApi
  ): PrioridadeSolicitacaoNome {
    return prioridade === 'ALTA' ? 'Alta' : 'Normal';
  }

  private obterReferencia(solicitacao: SolicitacaoResponse): string {
    if (solicitacao.tipo === 'SOLICITACAO_FERIAS') {
      return `${this.formatarData(solicitacao.dataInicio)} a ${this.formatarData(
        solicitacao.dataFim
      )}`;
    }

    if (solicitacao.tipo === 'CORRECAO_CADASTRO') {
      return solicitacao.campoCadastro
        ? this.obterLabelCampo(solicitacao.campoCadastro)
        : 'Campo cadastral';
    }

    return this.formatarData(solicitacao.dataReferencia);
  }

  private obterHorarios(solicitacao: SolicitacaoResponse): string | undefined {
    const horarios = [
      ['Entrada', solicitacao.entradaSolicitada],
      ['Início do intervalo', solicitacao.inicioIntervaloSolicitado],
      ['Fim do intervalo', solicitacao.fimIntervaloSolicitado],
      ['Saída', solicitacao.saidaSolicitada],
    ]
      .filter((item) => Boolean(item[1]))
      .map((item) => `${item[0]}: ${this.formatarHora(item[1])}`);

    return horarios.length ? horarios.join(' · ') : undefined;
  }

  private obterLabelCampo(campo: string): string {
    const normalizado = this.normalizarTexto(campo);

    const labels: Record<string, string> = {
      nome: 'Nome completo',
      'nome completo': 'Nome completo',
      email: 'E-mail corporativo',
      'email corporativo': 'E-mail corporativo',
      cpf: 'CPF',
      telefone: 'Telefone',
      'data nascimento': 'Data de nascimento',
      'data de nascimento': 'Data de nascimento',
      'estado civil': 'Estado civil',
      nacionalidade: 'Nacionalidade',
      naturalidade: 'Naturalidade',
      'local trabalho': 'Local de trabalho',
      'local de trabalho': 'Local de trabalho',
    };

    return labels[normalizado] ?? campo;
  }

  private formatarHora(hora: string | null | undefined): string {
    return hora ? hora.substring(0, 5) : 'Não informado';
  }

  private formatarData(data: string | null): string {
    if (!data) {
      return 'Não informada';
    }

    const [ano, mes, dia] = data.split('-');

    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
  }

  private formatarDataHora(dataHora: string): string {
    return this.formatarData(dataHora.split('T')[0]);
  }

  private obterMensagemErro(erro: unknown, mensagemPadrao: string): string {
    if (erro instanceof TimeoutError) {
      return 'O servidor demorou para responder. Tente novamente.';
    }

    if (!(erro instanceof HttpErrorResponse)) {
      return mensagemPadrao;
    }

    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    if (typeof erro.error?.mensagem === 'string') {
      return erro.error.mensagem;
    }

    if (typeof erro.error?.message === 'string') {
      return erro.error.message;
    }

    if (typeof erro.error?.erro === 'string') {
      return erro.error.erro;
    }

    return mensagemPadrao;
  }

  private limparCamposEspecificos(): void {
    this.formulario.dataRelacionada = '';
    this.formulario.entradaSolicitada = '';
    this.formulario.inicioIntervaloSolicitado = '';
    this.formulario.fimIntervaloSolicitado = '';
    this.formulario.saidaSolicitada = '';
    this.formulario.dataInicio = '';
    this.formulario.dataFim = '';
    this.formulario.campoCadastro = '';
    this.formulario.novoValor = '';
    this.formulario.anexo = '';

    this.limparInputAnexo();
  }

  private limparInputAnexo(): void {
    this.anexoSelecionado = null;
    this.formulario.anexo = '';

    if (this.inputAnexo) {
      this.inputAnexo
        .nativeElement
        .value = '';
    }
  }

  private valorOuUndefined(valor: string): string | undefined {
    const texto = valor.trim();
    return texto || undefined;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[_-]/g, ' ')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private criarFormularioInicial(): FormularioSolicitacao {
    return {
      tipo: 'Correção de ponto',
      prioridade: 'Normal',
      dataRelacionada: '',
      entradaSolicitada: '',
      inicioIntervaloSolicitado: '',
      fimIntervaloSolicitado: '',
      saidaSolicitada: '',
      dataInicio: '',
      dataFim: '',
      campoCadastro: '',
      novoValor: '',
      descricao: '',
      anexo: '',
    };
  }
}