import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioLogadoService } from '../../../core/services/usuario-logado.service';

type StatusSolicitacao = 'Pendente' | 'Aprovada' | 'Rejeitada';
type PrioridadeSolicitacao = 'Normal' | 'Alta';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoes-component.html',
  styleUrl: './solicitacoes-component.css',
})
export class SolicitacoesComponent {
  filtroBusca = '';
  filtroStatus = 'Todos';
  filtroTipo = 'Todos';
  filtroSetor = 'Todos';

  solicitacaoSelecionada: SolicitacaoGestao | null = null;
  observacaoAnalise = '';
  erroAnalise = '';
  mensagemFeedback = '';

  readonly statusDisponiveis = ['Todos', 'Pendente', 'Aprovada', 'Rejeitada'];

  solicitacoes: SolicitacaoGestao[] = [
    {
      id: 1,
      protocolo: '#SOL-1042',
      funcionario: 'João Pereira',
      matricula: 'MAT-2026-018',
      setor: 'Operações',
      cargo: 'Auxiliar Operacional',
      tipo: 'Correção de ponto',
      prioridade: 'Alta',
      dataSolicitacao: '01/08/2026',
      dataReferencia: '31/07/2026',
      horarioSolicitado: '13:08',
      descricao: 'O retorno do almoço não foi registrado. Retornei ao setor às 13:08 e permaneci trabalhando normalmente até o fim do expediente.',
      status: 'Pendente',
      anexo: 'comprovante-retorno.pdf',
    },
    {
      id: 2,
      protocolo: '#SOL-1041',
      funcionario: 'Mariana Costa',
      matricula: 'MAT-2026-031',
      setor: 'Comercial',
      cargo: 'Consultora de Vendas',
      tipo: 'Justificativa de falta',
      prioridade: 'Alta',
      dataSolicitacao: '01/08/2026',
      dataReferencia: '30/07/2026',
      descricao: 'Não compareci por atendimento médico de urgência. Encaminhei o atestado para análise do RH.',
      status: 'Pendente',
      anexo: 'atestado-medico.jpg',
    },
    {
      id: 3,
      protocolo: '#SOL-1040',
      funcionario: 'Pedro Santos',
      matricula: 'MAT-2025-087',
      setor: 'Tecnologia',
      cargo: 'Desenvolvedor Jr.',
      tipo: 'Solicitação de férias',
      prioridade: 'Normal',
      dataSolicitacao: '31/07/2026',
      dataReferencia: '14/09/2026 a 28/09/2026',
      descricao: 'Solicito 15 dias de férias no período informado. As entregas atuais serão organizadas com a equipe antes do afastamento.',
      status: 'Pendente',
    },
    {
      id: 4,
      protocolo: '#SOL-1039',
      funcionario: 'Camila Rocha',
      matricula: 'MAT-2024-042',
      setor: 'Administrativo',
      cargo: 'Assistente Administrativa',
      tipo: 'Correção de cadastro',
      prioridade: 'Normal',
      dataSolicitacao: '30/07/2026',
      dataReferencia: '30/07/2026',
      descricao: 'Solicito a atualização do meu telefone de contato e do complemento do endereço residencial.',
      status: 'Pendente',
    },
    {
      id: 5,
      protocolo: '#SOL-1038',
      funcionario: 'Bruna Lima',
      matricula: 'MAT-2023-014',
      setor: 'Operações',
      cargo: 'Supervisora',
      tipo: 'Correção de ponto',
      prioridade: 'Normal',
      dataSolicitacao: '29/07/2026',
      dataReferencia: '29/07/2026',
      horarioSolicitado: '08:03',
      descricao: 'A entrada não apareceu no histórico, embora o registro tenha sido realizado no relógio de ponto às 08:03.',
      status: 'Aprovada',
      observacaoAnalise: 'Registro confirmado no equipamento de ponto e incluído no histórico da funcionária.',
      analisadoPor: 'Renata Souza',
      dataAnalise: '30/07/2026',
    },
    {
      id: 6,
      protocolo: '#SOL-1037',
      funcionario: 'Lucas Martins',
      matricula: 'MAT-2025-063',
      setor: 'Financeiro',
      cargo: 'Analista Financeiro',
      tipo: 'Justificativa de falta',
      prioridade: 'Normal',
      dataSolicitacao: '28/07/2026',
      dataReferencia: '25/07/2026',
      descricao: 'Solicito justificativa da ausência devido a um compromisso pessoal inadiável.',
      status: 'Rejeitada',
      observacaoAnalise: 'O pedido foi enviado fora do prazo e não possui documento comprobatório.',
      analisadoPor: 'Carla Mendes',
      dataAnalise: '29/07/2026',
    },
    {
      id: 7,
      protocolo: '#SOL-1036',
      funcionario: 'Ana Beatriz',
      matricula: 'MAT-2026-052',
      setor: 'Marketing',
      cargo: 'Assistente de Marketing',
      tipo: 'Correção de cadastro',
      prioridade: 'Normal',
      dataSolicitacao: '27/07/2026',
      dataReferencia: '27/07/2026',
      descricao: 'Solicito alteração do número de telefone para contato corporativo.',
      status: 'Aprovada',
      observacaoAnalise: 'Dados conferidos e atualizados conforme solicitado.',
      analisadoPor: 'Renata Souza',
      dataAnalise: '28/07/2026',
    },
    {
      id: 8,
      protocolo: '#SOL-1035',
      funcionario: 'Rafael Oliveira',
      matricula: 'MAT-2024-026',
      setor: 'Comercial',
      cargo: 'Executivo de Contas',
      tipo: 'Solicitação de férias',
      prioridade: 'Normal',
      dataSolicitacao: '25/07/2026',
      dataReferencia: '04/08/2026 a 18/08/2026',
      descricao: 'Solicitação de férias referente ao período aquisitivo atual.',
      status: 'Rejeitada',
      observacaoAnalise: 'Período indisponível por conflito com a escala do setor. Solicitar novas datas ao gestor imediato.',
      analisadoPor: 'Carla Mendes',
      dataAnalise: '26/07/2026',
    },
  ];

  constructor(private usuarioLogadoService: UsuarioLogadoService) {}

  get tiposDisponiveis(): string[] {
    return ['Todos', ...new Set(this.solicitacoes.map((item) => item.tipo))];
  }

  get setoresDisponiveis(): string[] {
    return ['Todos', ...new Set(this.solicitacoes.map((item) => item.setor))];
  }

  get solicitacoesFiltradas(): SolicitacaoGestao[] {
    const busca = this.normalizarTexto(this.filtroBusca);

    return this.solicitacoes.filter((item) => {
      const correspondeBusca =
        !busca ||
        [item.funcionario, item.protocolo, item.matricula, item.setor, item.tipo]
          .map((valor) => this.normalizarTexto(valor))
          .some((valor) => valor.includes(busca));

      const correspondeStatus = this.filtroStatus === 'Todos' || item.status === this.filtroStatus;
      const correspondeTipo = this.filtroTipo === 'Todos' || item.tipo === this.filtroTipo;
      const correspondeSetor = this.filtroSetor === 'Todos' || item.setor === this.filtroSetor;

      return correspondeBusca && correspondeStatus && correspondeTipo && correspondeSetor;
    });
  }

  get totalPendentes(): number {
    return this.solicitacoes.filter((item) => item.status === 'Pendente').length;
  }

  get totalAltaPrioridade(): number {
    return this.solicitacoes.filter((item) => item.status === 'Pendente' && item.prioridade === 'Alta').length;
  }

  get totalAprovadas(): number {
    return this.solicitacoes.filter((item) => item.status === 'Aprovada').length;
  }

  get totalRejeitadas(): number {
    return this.solicitacoes.filter((item) => item.status === 'Rejeitada').length;
  }

  get quantidadeFiltrosAtivos(): number {
    return [
      this.filtroBusca.trim() !== '',
      this.filtroStatus !== 'Todos',
      this.filtroTipo !== 'Todos',
      this.filtroSetor !== 'Todos',
    ].filter(Boolean).length;
  }

  abrirDetalhes(solicitacao: SolicitacaoGestao): void {
    this.solicitacaoSelecionada = solicitacao;
    this.observacaoAnalise = solicitacao.observacaoAnalise ?? '';
    this.erroAnalise = '';
  }

  fecharDetalhes(): void {
    this.solicitacaoSelecionada = null;
    this.observacaoAnalise = '';
    this.erroAnalise = '';
  }

  aprovarSelecionada(): void {
    if (!this.solicitacaoSelecionada) {
      return;
    }

    this.concluirAnalise('Aprovada');
  }

  rejeitarSelecionada(): void {
    if (!this.solicitacaoSelecionada) {
      return;
    }

    if (!this.observacaoAnalise.trim()) {
      this.erroAnalise = 'Informe o motivo da rejeição antes de concluir a análise.';
      return;
    }

    this.concluirAnalise('Rejeitada');
  }

  limparFiltros(): void {
    this.filtroBusca = '';
    this.filtroStatus = 'Todos';
    this.filtroTipo = 'Todos';
    this.filtroSetor = 'Todos';
  }

  statusClasse(status: StatusSolicitacao): string {
    const classes: Record<StatusSolicitacao, string> = {
      Pendente: 'status-pendente',
      Aprovada: 'status-aprovada',
      Rejeitada: 'status-rejeitada',
    };

    return classes[status];
  }

  prioridadeClasse(prioridade: PrioridadeSolicitacao): string {
    return prioridade === 'Alta' ? 'prioridade-alta' : 'prioridade-normal';
  }

  tipoClasse(tipo: TipoSolicitacao): string {
    const classes: Record<TipoSolicitacao, string> = {
      'Correção de ponto': 'tipo-ponto',
      'Justificativa de falta': 'tipo-falta',
      'Solicitação de férias': 'tipo-ferias',
      'Correção de cadastro': 'tipo-cadastro',
    };

    return classes[tipo];
  }

  tipoIcone(tipo: TipoSolicitacao): string {
    const icones: Record<TipoSolicitacao, string> = {
      'Correção de ponto': 'bi-clock-history',
      'Justificativa de falta': 'bi-calendar-x',
      'Solicitação de férias': 'bi-suitcase-lg',
      'Correção de cadastro': 'bi-person-lines-fill',
    };

    return icones[tipo];
  }

  iniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join('');
  }

  trackById(_index: number, item: SolicitacaoGestao): number {
    return item.id;
  }

  private concluirAnalise(status: Exclude<StatusSolicitacao, 'Pendente'>): void {
    if (!this.solicitacaoSelecionada) {
      return;
    }

    const usuario = this.usuarioLogadoService.obterUsuarioLogado();
    const observacaoPadrao =
      status === 'Aprovada'
        ? 'Solicitação aprovada após a conferência das informações apresentadas.'
        : this.observacaoAnalise.trim();

    this.solicitacaoSelecionada.status = status;
    this.solicitacaoSelecionada.observacaoAnalise = this.observacaoAnalise.trim() || observacaoPadrao;
    this.solicitacaoSelecionada.analisadoPor = usuario?.nome ?? 'Equipe de Gestão/RH';
    this.solicitacaoSelecionada.dataAnalise = new Date().toLocaleDateString('pt-BR');

    this.mensagemFeedback = `${this.solicitacaoSelecionada.protocolo} foi ${
      status === 'Aprovada' ? 'aprovada' : 'rejeitada'
    } com sucesso.`;

    this.fecharDetalhes();
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
