import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UsuarioLogadoService } from '../../../core/services/usuario-logado.service';
import { TipoUsuario } from '../../../models/tipoUsuario';

interface DadosPessoais {
  nome: string;
  matricula: string;
  setor: string;
  cargo: string;
  status: string;
  horarioPadrao: string;
  telefone: string;
  emailCorporativo: string;
  endereco: string;
  dataAdmissao: string;
}

interface CampoAlteravel {
  label: string;
  valor: string;
  icone: string;
  descricao: string;
  placeholder: string;
}

interface CampoVisivel {
  label: string;
  valor: string;
  icone: string;
  bloqueado?: boolean;
}

interface FormSolicitacaoDados {
  campo: string;
  novoValor: string;
  justificativa: string;
}

interface SolicitacaoDados {
  codigo: string;
  campo: string;
  novoValor: string;
  justificativa: string;
  data: string;
  status: string;
  classe: string;
}

@Component({
  selector: 'app-meus-dados-componente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meus-dados-componente.html',
  styleUrl: './meus-dados-componente.css'
})
export class MeusDadosComponente {
  readonly modoGestao: boolean;
  perfilAtual = 'Funcionário';
  iniciaisUsuario = 'MS';

  dados: DadosPessoais = {
    nome: 'Maria Silva',
    matricula: '1024',
    setor: 'Tecnologia da Informação',
    cargo: 'Desenvolvedora Fullstack',
    status: 'Ativo',
    horarioPadrao: '08:00 às 17:00',
    telefone: '(21) 9 9999-9999',
    emailCorporativo: 'maria.silva@empresa.com',
    endereco: 'Rua das Flores, 120 - Méier, Rio de Janeiro/RJ',
    dataAdmissao: '12/03/2024'
  };

  camposAlteraveis: CampoAlteravel[] = [
    {
      label: 'Nome',
      valor: 'nome',
      icone: 'bi-person',
      descricao: 'Correção de nome exibido no cadastro.',
      placeholder: 'Exemplo: Maria Eduarda Silva'
    },
    {
      label: 'Telefone',
      valor: 'telefone',
      icone: 'bi-telephone',
      descricao: 'Atualização do telefone de contato.',
      placeholder: 'Exemplo: (21) 9 8888-7777'
    },
    {
      label: 'E-mail corporativo',
      valor: 'emailCorporativo',
      icone: 'bi-envelope',
      descricao: 'Correção do e-mail usado na empresa.',
      placeholder: 'Exemplo: nome.sobrenome@empresa.com'
    },
    {
      label: 'Endereço',
      valor: 'endereco',
      icone: 'bi-geo-alt',
      descricao: 'Atualização do endereço residencial.',
      placeholder: 'Exemplo: Rua, número, bairro, cidade/UF'
    },
    {
      label: 'Horário padrão',
      valor: 'horarioPadrao',
      icone: 'bi-clock',
      descricao: 'Solicitação de ajuste na jornada padrão.',
      placeholder: 'Exemplo: 09:00 às 18:00'
    }
  ];

  solicitacaoAtual: FormSolicitacaoDados = this.criarFormularioVazio();
  solicitacaoEnviada: SolicitacaoDados | null = null;

  historicoSolicitacoes: SolicitacaoDados[] = [
    {
      codigo: '#ALT-002',
      campo: 'Telefone',
      novoValor: '(21) 9 7777-1234',
      justificativa: 'Atualização de telefone pessoal.',
      data: '03/07/2026',
      status: 'Pendente',
      classe: 'text-bg-warning'
    },
    {
      codigo: '#ALT-001',
      campo: 'Endereço',
      novoValor: 'Rua Nova, 45 - Rio de Janeiro/RJ',
      justificativa: 'Mudança de residência.',
      data: '18/06/2026',
      status: 'Concluída',
      classe: 'text-bg-success'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private usuarioLogadoService: UsuarioLogadoService
  ) {
    this.modoGestao = this.route.snapshot.data['area'] === 'gestao';
    this.carregarDadosUsuarioLogado();
  }

  get dadosVisiveis(): CampoVisivel[] {
    return [
      { label: 'Nome', valor: this.dados.nome, icone: 'bi-person' },
      { label: 'Matrícula', valor: this.dados.matricula, icone: 'bi-shield-lock', bloqueado: true },
      { label: 'Setor', valor: this.dados.setor, icone: 'bi-diagram-3' },
      { label: 'Cargo', valor: this.dados.cargo, icone: 'bi-briefcase' },
      { label: 'Status', valor: this.dados.status, icone: 'bi-check-circle' },
      { label: 'Horário padrão', valor: this.dados.horarioPadrao, icone: 'bi-clock' },
      { label: 'Telefone', valor: this.dados.telefone, icone: 'bi-telephone' },
      { label: 'E-mail corporativo', valor: this.dados.emailCorporativo, icone: 'bi-envelope' },
      { label: 'Endereço', valor: this.dados.endereco, icone: 'bi-geo-alt' },
      { label: 'Data de admissão', valor: this.dados.dataAdmissao, icone: 'bi-calendar-check' }
    ];
  }

  get placeholderNovoDado(): string {
    return this.campoSelecionado?.placeholder ?? 'Informe o novo dado';
  }

  private get campoSelecionado(): CampoAlteravel | undefined {
    return this.camposAlteraveis.find((campo) => campo.valor === this.solicitacaoAtual.campo);
  }

  enviarSolicitacaoDados(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const campo = this.campoSelecionado;

    if (!campo) {
      return;
    }

    const novaSolicitacao: SolicitacaoDados = {
      codigo: this.gerarCodigoSolicitacao(),
      campo: campo.label,
      novoValor: this.solicitacaoAtual.novoValor.trim(),
      justificativa: this.solicitacaoAtual.justificativa.trim(),
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
      classe: 'text-bg-warning'
    };

    this.historicoSolicitacoes = [novaSolicitacao, ...this.historicoSolicitacoes];
    this.solicitacaoEnviada = novaSolicitacao;
    this.limparFormulario(form);

    // Quando o back-end estiver pronto, aqui entra a chamada do service.
    // this.solicitacaoService.criarSolicitacaoAlteracaoDados(novaSolicitacao).subscribe(...)
  }

  limparFormulario(form?: NgForm): void {
    this.solicitacaoAtual = this.criarFormularioVazio();
    form?.resetForm(this.solicitacaoAtual);
  }

  private carregarDadosUsuarioLogado(): void {
    const usuarioLogado = this.usuarioLogadoService.obterUsuarioLogado();

    if (!usuarioLogado) {
      return;
    }

    this.perfilAtual = this.obterNomePerfil(usuarioLogado.tipo);
    this.iniciaisUsuario = usuarioLogado.iniciais;

    this.dados = {
      ...this.dados,
      ...this.obterDadosComplementares(usuarioLogado.tipo),
      nome: usuarioLogado.nome,
      setor: usuarioLogado.setor,
      cargo: usuarioLogado.cargo,
      emailCorporativo: usuarioLogado.email
    };

    if (this.modoGestao) {
      this.historicoSolicitacoes = [];
    }
  }

  private obterNomePerfil(tipo: TipoUsuario): string {
    const nomes: Record<TipoUsuario, string> = {
      funcionario: 'Funcionário',
      gestor: 'Gestor',
      rh: 'RH'
    };

    return nomes[tipo];
  }

  private obterDadosComplementares(tipo: TipoUsuario): Partial<DadosPessoais> {
    if (tipo === 'rh') {
      return {
        matricula: '3072',
        horarioPadrao: '09:00 às 18:00',
        telefone: '(21) 9 9333-3072',
        endereco: 'Rua do Catete, 210 - Catete, Rio de Janeiro/RJ',
        dataAdmissao: '07/02/2022'
      };
    }

    if (tipo === 'gestor') {
      return {
        matricula: '2048',
        horarioPadrao: '08:00 às 17:00',
        telefone: '(21) 9 9555-2048',
        endereco: 'Rua Voluntários da Pátria, 340 - Botafogo, Rio de Janeiro/RJ',
        dataAdmissao: '05/08/2021'
      };
    }

    return {};
  }

  private criarFormularioVazio(): FormSolicitacaoDados {
    return {
      campo: '',
      novoValor: '',
      justificativa: ''
    };
  }

  private gerarCodigoSolicitacao(): string {
    const proximoNumero = this.historicoSolicitacoes.length + 1;
    return `#ALT-${String(proximoNumero).padStart(3, '0')}`;
  }
}
