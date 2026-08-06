import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { timeout } from 'rxjs';
import { FormsModule, NgForm, } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { SolicitacaoService } from '../../../core/services/solicitacao';
import { SolicitacaoResponse, StatusSolicitacao, } from '../../../models/solicitacao';

import { FuncionarioService } from '../../../core/services/funcionario';
import { UsuarioLogadoService } from '../../../core/services/usuario-logado.service';
import { TipoUsuario } from '../../../models/tipoUsuario';

interface DadosPessoais {
  nome: string;
  matricula: string;
  cpf: string;
  telefone: string;
  emailCorporativo: string;
  dataNascimento: string;
  estadoCivil: string;
  nacionalidade: string;
  naturalidade: string;
  setor: string;
  cargo: string;
  status: string;
  dataAdmissao: string;
  tipoVinculo: string;
  cargaHorariaSemanal: string;
  gestorImediato: string;
  localTrabalho: string;
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
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './meus-dados-componente.html',
  styleUrl: './meus-dados-componente.css',
})

export class MeusDadosComponente implements OnInit {

  readonly modoGestao: boolean;

  perfilAtual = 'Funcionário';
  iniciaisUsuario = '';

  carregandoDados = true;
  erroDados = '';

  dados: DadosPessoais = {
    nome: '',
    matricula: '',
    cpf: '',
    telefone: '',
    emailCorporativo: '',
    dataNascimento: '',
    estadoCivil: '',
    nacionalidade: '',
    naturalidade: '',
    setor: '',
    cargo: '',
    status: '',
    dataAdmissao: '',
    tipoVinculo: '',
    cargaHorariaSemanal: '',
    gestorImediato: '',
    localTrabalho: '',
  };

  camposAlteraveis: CampoAlteravel[] = [
    {
      label: 'Nome',
      valor: 'nome',
      icone: 'bi-person',
      descricao: 'Correção do nome exibido no cadastro.',
      placeholder: 'Exemplo: Maria Eduarda Silva',
    },
    {
      label: 'E-mail corporativo',
      valor: 'email corporativo',
      icone: 'bi-envelope',
      descricao: 'Correção do e-mail usado na empresa.',
      placeholder: 'Exemplo: nome.sobrenome@empresa.com',
    },
    {
      label: 'CPF',
      valor: 'cpf',
      icone: 'bi-card-text',
      descricao: 'Correção do CPF registrado.',
      placeholder: 'Exemplo: 123.456.789-00',
    },
    {
      label: 'Telefone',
      valor: 'telefone',
      icone: 'bi-telephone',
      descricao: 'Atualização do telefone de contato.',
      placeholder: 'Exemplo: (21) 98888-7777',
    },
    {
      label: 'Data de nascimento',
      valor: 'data de nascimento',
      icone: 'bi-calendar',
      descricao: 'Correção da data de nascimento.',
      placeholder: 'Exemplo: 1990-04-10',
    },
    {
      label: 'Estado civil',
      valor: 'estado civil',
      icone: 'bi-people',
      descricao: 'Atualização do estado civil.',
      placeholder: 'Exemplo: Solteiro(a)',
    },
    {
      label: 'Nacionalidade',
      valor: 'nacionalidade',
      icone: 'bi-globe-americas',
      descricao: 'Atualização da nacionalidade.',
      placeholder: 'Exemplo: Brasileira',
    },
    {
      label: 'Naturalidade',
      valor: 'naturalidade',
      icone: 'bi-geo',
      descricao: 'Atualização da naturalidade.',
      placeholder: 'Exemplo: Rio de Janeiro',
    },
    {
      label: 'Local de trabalho',
      valor: 'local de trabalho',
      icone: 'bi-building',
      descricao: 'Atualização do local de trabalho.',
      placeholder: 'Exemplo: Rio de Janeiro',
    },
  ];

  solicitacaoAtual: FormSolicitacaoDados = this.criarFormularioVazio();

  solicitacaoEnviada: SolicitacaoDados | null = null;
  /*
   * Este histórico ainda está simulado.
   * Vamos integrá-lo ao backend na próxima etapa.
   */
  historicoSolicitacoes: SolicitacaoDados[] = [];

  carregandoSolicitacoes = false;
  enviandoSolicitacao = false;

  erroSolicitacao = '';
  constructor(
    private readonly route: ActivatedRoute,

    private readonly usuarioLogadoService:
      UsuarioLogadoService,

    private readonly funcionarioService:
      FuncionarioService,

    private readonly cdr:
      ChangeDetectorRef,

    private readonly solicitacaoService:
      SolicitacaoService
  ) {
    this.modoGestao =
      this.route.snapshot.data['area']
      === 'gestao';
  }



  ngOnInit(): void {
    this.carregarUsuarioDaSessao();
    this.carregarPerfilBackend();
    this.carregarHistoricoSolicitacoes();
  }

  get dadosVisiveis(): CampoVisivel[] {
    return [
      {
        label: 'Nome',
        valor: this.dados.nome,
        icone: 'bi-person',
      },
      {
        label: 'Matrícula',
        valor: this.dados.matricula,
        icone: 'bi-shield-lock',
        bloqueado: true,
      },
      {
        label: 'CPF',
        valor: this.dados.cpf,
        icone: 'bi-card-text',
      },
      {
        label: 'Telefone',
        valor: this.dados.telefone,
        icone: 'bi-telephone',
      },
      {
        label: 'E-mail corporativo',
        valor: this.dados.emailCorporativo,
        icone: 'bi-envelope',
      },
      {
        label: 'Data de nascimento',
        valor: this.dados.dataNascimento,
        icone: 'bi-calendar',
      },
      {
        label: 'Estado civil',
        valor: this.dados.estadoCivil,
        icone: 'bi-people',
      },
      {
        label: 'Nacionalidade',
        valor: this.dados.nacionalidade,
        icone: 'bi-globe-americas',
      },
      {
        label: 'Naturalidade',
        valor: this.dados.naturalidade,
        icone: 'bi-geo',
      },
      {
        label: 'Setor',
        valor: this.dados.setor,
        icone: 'bi-diagram-3',
        bloqueado: true,
      },
      {
        label: 'Cargo',
        valor: this.dados.cargo,
        icone: 'bi-briefcase',
        bloqueado: true,
      },
      {
        label: 'Status',
        valor: this.dados.status,
        icone: 'bi-check-circle',
        bloqueado: true,
      },
      {
        label: 'Data de admissão',
        valor: this.dados.dataAdmissao,
        icone: 'bi-calendar-check',
        bloqueado: true,
      },
      {
        label: 'Tipo de vínculo',
        valor: this.dados.tipoVinculo,
        icone: 'bi-file-earmark-person',
        bloqueado: true,
      },
      {
        label: 'Carga horária semanal',
        valor: this.dados.cargaHorariaSemanal,
        icone: 'bi-clock',
        bloqueado: true,
      },
      {
        label: 'Gestor imediato',
        valor: this.dados.gestorImediato,
        icone: 'bi-person-badge',
        bloqueado: true,
      },
      {
        label: 'Local de trabalho',
        valor: this.dados.localTrabalho,
        icone: 'bi-building',
      },
    ];
  }

  get placeholderNovoDado(): string {
    return this.campoSelecionado?.placeholder ?? 'Informe o novo dado';
  }

  private get campoSelecionado():
    CampoAlteravel | undefined {

    return this.camposAlteraveis.find((campo) => campo.valor === this.solicitacaoAtual.campo);
  }

  enviarSolicitacaoDados(
    form: NgForm
  ): void {
    if (
      form.invalid
      || this.enviandoSolicitacao
    ) {
      form.control.markAllAsTouched();
      return;
    }

    const campo =
      this.campoSelecionado;

    if (!campo) {
      return;
    }

    this.enviandoSolicitacao = true;
    this.erroSolicitacao = '';
    this.solicitacaoEnviada = null;

    this.solicitacaoService
      .criar({
        tipo:
          'CORRECAO_CADASTRO',

        prioridade:
          'NORMAL',

        campoCadastro:
          campo.valor,

        novoValor:
          this.solicitacaoAtual
            .novoValor
            .trim(),

        justificativa:
          this.solicitacaoAtual
            .justificativa
            .trim(),
      })
      .subscribe({
        next: (solicitacao) => {
          const item =
            this.converterSolicitacao(
              solicitacao
            );

          this.historicoSolicitacoes = [
            item,
            ...this.historicoSolicitacoes,
          ];

          this.solicitacaoEnviada =
            item;

          this.enviandoSolicitacao =
            false;

          this.limparFormulario(form);

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {
          console.error(
            'Erro ao enviar solicitação:',
            erro
          );

          this.erroSolicitacao =
            this.obterMensagemErroSolicitacao(
              erro
            );

          this.enviandoSolicitacao =
            false;

          this.cdr.detectChanges();
        },
      });
  }

  limparFormulario(form?: NgForm): void {

    this.solicitacaoAtual = this.criarFormularioVazio();

    form?.resetForm(this.solicitacaoAtual);
  }

  private carregarUsuarioDaSessao(): void {

    const usuarioLogado = this.usuarioLogadoService.obterUsuarioLogado();

    if (!usuarioLogado) {
      return;
    }

    this.perfilAtual = this.obterNomePerfil(usuarioLogado.tipo);

    this.iniciaisUsuario = usuarioLogado.iniciais;

    if (this.modoGestao) {
      this.historicoSolicitacoes = [];
    }

  }

  private carregarPerfilBackend(): void {
    this.carregandoDados = true;
    this.erroDados = '';

    this.funcionarioService
      .buscarMeuPerfil()
      .pipe(
        timeout(10000)
      )
      .subscribe({
        next: (perfil) => {
          console.log(
            'Perfil recebido:',
            perfil
          );

          this.dados = {
            nome:
              perfil.nomeCompleto,

            matricula:
              perfil.matricula,

            cpf:
              perfil.cpf
              || 'Não informado',

            telefone:
              perfil.telefone
              || 'Não informado',

            emailCorporativo:
              perfil.emailCorporativo,

            dataNascimento:
              this.formatarData(
                perfil.dataNascimento
              ),

            estadoCivil:
              perfil.estadoCivil
              || 'Não informado',

            nacionalidade:
              perfil.nacionalidade
              || 'Não informada',

            naturalidade:
              perfil.naturalidade
              || 'Não informada',

            setor:
              perfil.setor
              || 'Não informado',

            cargo:
              perfil.cargo
              || 'Não informado',

            status:
              perfil.status,

            dataAdmissao:
              this.formatarData(
                perfil.dataAdmissao
              ),

            tipoVinculo:
              perfil.tipoVinculo
              || 'Não informado',

            cargaHorariaSemanal:
              perfil.cargaHorariaSemanal
                ? `${perfil.cargaHorariaSemanal} horas`
                : 'Não informada',

            gestorImediato:
              perfil.gestorImediato
              || 'Não informado',

            localTrabalho:
              perfil.localTrabalho
              || 'Não informado',
          };

          this.carregandoDados = false;

          /*
           * Força a tela a reconhecer
           * os novos valores.
           */
          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {
          console.error(
            'Erro ao carregar perfil:',
            erro
          );

          if (erro.status === 401) {
            this.erroDados =
              'Sua sessão expirou. Entre novamente.';
          } else if (erro.status === 0) {
            this.erroDados =
              'Não foi possível conectar ao servidor.';
          } else {
            this.erroDados =
              'Não foi possível carregar seus dados.';
          }

          this.carregandoDados = false;

          this.cdr.detectChanges();
        },
      });
  }

  private carregarHistoricoSolicitacoes(): void {
    this.carregandoSolicitacoes = true;
    this.erroSolicitacao = '';

    this.solicitacaoService
      .listarMinhas()
      .subscribe({
        next: (solicitacoes) => {
          this.historicoSolicitacoes =
            solicitacoes
              .filter(
                (solicitacao) =>
                  solicitacao.tipo === 'CORRECAO_CADASTRO'
              )
              .map(
                (solicitacao) =>
                  this.converterSolicitacao(
                    solicitacao
                  )
              );

          this.carregandoSolicitacoes = false;

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {
          console.error(
            'Erro ao carregar solicitações:',
            erro
          );

          this.erroSolicitacao =
            'Não foi possível carregar suas solicitações.';

          this.carregandoSolicitacoes = false;

          this.cdr.detectChanges();
        },
      });
  }

  private obterNomePerfil(tipo: TipoUsuario): string {

    const nomes: Record<TipoUsuario, string> = {

      funcionario: 'Funcionário',

      gestor: 'Gestor',

      rh: 'RH',
    };

    return nomes[tipo];
  }

  private formatarData(data: string | null): string {

    if (!data) {
      return 'Não informada';
    }

    const partes = data.split('-');

    if (partes.length !== 3) {
      return data;
    }

    const [ano, mes, dia,] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  private criarFormularioVazio():

    FormSolicitacaoDados {
    return {
      campo: '',
      novoValor: '',
      justificativa: '',
    };
  }

  // private gerarCodigoSolicitacao():
  //   string {

  //   const proximoNumero = this.historicoSolicitacoes.length + 1;

  //   return `#ALT-${String(proximoNumero).padStart(3, '0')}`;

  // }

  private converterSolicitacao(
    solicitacao: SolicitacaoResponse
  ): SolicitacaoDados {
    const apresentacaoStatus =
      this.obterApresentacaoStatus(
        solicitacao.status
      );

    return {
      codigo: solicitacao.protocolo,

      campo: this.obterLabelCampo(
        solicitacao.campoCadastro
      ),

      novoValor:
        solicitacao.novoValor
        || 'Não informado',

      justificativa:
        solicitacao.justificativa,

      data: this.formatarDataHora(
        solicitacao.criadoEm
      ),

      status:
        apresentacaoStatus.texto,

      classe:
        apresentacaoStatus.classe,
    };
  }

  private obterLabelCampo(
    campoCadastro: string | null
  ): string {
    if (!campoCadastro) {
      return 'Campo cadastral';
    }

    const campo =
      this.camposAlteraveis.find(
        (item) =>
          item.valor.toLowerCase()
          === campoCadastro.toLowerCase()
      );

    return campo?.label
      ?? campoCadastro;
  }

  private obterApresentacaoStatus(
    status: StatusSolicitacao
  ): {
    texto: string;
    classe: string;
  } {
    switch (status) {
      case 'APROVADA':
        return {
          texto: 'Aprovada',
          classe: 'text-bg-success',
        };

      case 'REJEITADA':
        return {
          texto: 'Rejeitada',
          classe: 'text-bg-danger',
        };

      case 'PENDENTE':
      default:
        return {
          texto: 'Pendente',
          classe: 'text-bg-warning',
        };
    }
  }

  private formatarDataHora(
    dataHora: string
  ): string {
    const data = dataHora.split('T')[0];

    return this.formatarData(data);
  }

  private obterMensagemErroSolicitacao(
    erro: HttpErrorResponse
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

    return 'Não foi possível enviar a solicitação.';
  }

}