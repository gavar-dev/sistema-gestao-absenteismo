import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, timeout } from 'rxjs';

import {
  FuncionarioAvatarComponent
} from '../../../shared/funcionario-avatar/funcionario-avatar';

import { FuncionarioService } from '../../../core/services/funcionario';
import { PontoService } from '../../../core/services/ponto.service';
import { UsuarioLogadoService } from '../../../core/services/usuario-logado.service';

import {FuncionarioResponse, FuncionarioUpdateRequest, StatusFuncionario, TipoVinculo,} from '../../../models/funcionario';
import {RegistroPontoResponse,} from '../../../models/ponto';
import { TipoUsuario } from '../../../models/tipoUsuario';

interface EstatisticasFuncionario {
  totalRegistros: number;
  atrasos: number;
  faltas: number;
  pendencias: number;
}

interface FuncionarioGestao {
  dados: FuncionarioResponse;
  estatisticas: EstatisticasFuncionario;
}

interface FormularioFuncionario {
  nomeCompleto: string;
  emailCorporativo: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  estadoCivil: string;
  nacionalidade: string;
  naturalidade: string;
  matricula: string;
  cargo: string;
  setor: string;
  dataAdmissao: string;
  tipoVinculo: TipoVinculo | '';
  cargaHorariaSemanal: number | null;
  gestorImediato: string;
  localTrabalho: string;
  tipoAcesso: TipoUsuario;
  status: StatusFuncionario;
}

interface ResultadoGestao {
  funcionarios: FuncionarioResponse[];
  registros: RegistroPontoResponse[];
}

@Component({
  selector: 'app-gestao-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FuncionarioAvatarComponent,
  ],
  templateUrl: './gestao-component.html',
  styleUrl: './gestao-component.css',
})
export class GestaoComponent
  implements OnInit {

  funcionarios: FuncionarioGestao[] = [];

  filtroBusca = '';
  filtroStatus = 'Todos';
  filtroSetor = 'Todos';
  filtroAcesso = 'Todos';

  carregando = true;
  processando = false;

  erroCarregamento = '';
  erroModal = '';
  mensagemFeedback = '';

  ehRh = false;
  usuarioLogadoId: number | null = null;

  funcionarioSelecionado:
    FuncionarioGestao | null = null;

  modoModal:
    'detalhes' | 'edicao' | null = null;

  statusSelecionado:
    StatusFuncionario = 'Ativo';

  confirmarDesativacao = false;

  formulario: FormularioFuncionario =
    this.criarFormularioVazio();

  readonly statusDisponiveis:
    StatusFuncionario[] = [
      'Ativo',
      'Férias',
      'Afastado',
      'Inativo',
    ];

  readonly tiposVinculo:
    TipoVinculo[] = [
      'CLT',
      'PJ',
      'Estágio',
      'Temporário',
      'Aprendiz',
    ];

  readonly tiposAcesso:
    TipoUsuario[] = [
      'funcionario',
      'gestor',
      'rh',
    ];

  private readonly inicioMes =
    this.obterPrimeiroDiaMes();

  private readonly hoje =
    this.formatarDataISO(new Date());

  constructor(
    private readonly funcionarioService:
      FuncionarioService,

    private readonly pontoService:
      PontoService,

    private readonly usuarioLogadoService:
      UsuarioLogadoService,

    private readonly cdr:
      ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const usuario =
      this.usuarioLogadoService
        .obterUsuarioLogado();

    this.ehRh =
      usuario?.tipo === 'rh';

    this.usuarioLogadoId =
      usuario?.id ?? null;

    this.carregarFuncionarios();
  }

  get funcionariosFiltrados():
    FuncionarioGestao[] {

    const busca =
      this.normalizarTexto(
        this.filtroBusca
      );

    return this.funcionarios.filter(
      (
        item: FuncionarioGestao
      ): boolean => {

        const funcionario = item.dados;

        const correspondeBusca =
          !busca ||
          [
            funcionario.nomeCompleto,
            funcionario.emailCorporativo,
            funcionario.matricula,
            funcionario.cargo,
            funcionario.setor,
          ]
            .map((valor: string) =>
              this.normalizarTexto(valor)
            )
            .some((valor: string) =>
              valor.includes(busca)
            );

        const correspondeStatus =
          this.filtroStatus === 'Todos' ||
          funcionario.status ===
          this.filtroStatus;

        const correspondeSetor =
          this.filtroSetor === 'Todos' ||
          funcionario.setor ===
          this.filtroSetor;

        const correspondeAcesso =
          this.filtroAcesso === 'Todos' ||
          funcionario.tipoAcesso ===
          this.filtroAcesso;

        return (
          correspondeBusca &&
          correspondeStatus &&
          correspondeSetor &&
          correspondeAcesso
        );
      }
    );
  }

  get setoresDisponiveis(): string[] {
    return [
      'Todos',
      ...Array.from(
        new Set(
          this.funcionarios
            .map(
              (
                item: FuncionarioGestao
              ): string =>
                item.dados.setor
            )
            .filter(Boolean)
        )
      ).sort(
        (
          a: string,
          b: string
        ): number =>
          a.localeCompare(
            b,
            'pt-BR'
          )
      ),
    ];
  }

  get totalAtivos(): number {
    return this.contarStatus('Ativo');
  }

  get totalFerias(): number {
    return this.contarStatus('Férias');
  }

  get totalAfastados(): number {
    return this.contarStatus('Afastado');
  }

  get totalInativos(): number {
    return this.contarStatus('Inativo');
  }

  get totalOcorrencias(): number {
    return this.funcionarios.reduce(
      (
        total: number,
        item: FuncionarioGestao
      ): number =>
        total +
        item.estatisticas.atrasos +
        item.estatisticas.faltas +
        item.estatisticas.pendencias,
      0
    );
  }

  get podeDesativarSelecionado():
    boolean {

    const selecionado =
      this.funcionarioSelecionado;

    return (
      this.ehRh &&
      selecionado !== null &&
      selecionado.dados.status !==
      'Inativo' &&
      selecionado.dados.id !==
      this.usuarioLogadoId
    );
  }

  carregarFuncionarios(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    this.mensagemFeedback = '';

    forkJoin({
      funcionarios:
        this.funcionarioService.listar(),

      registros:
        this.pontoService
          .buscarRegistrosGerenciais(
            this.inicioMes,
            this.hoje
          ),
    })
      .pipe(timeout(10000))
      .subscribe({
        next: (
          resultado: ResultadoGestao
        ) => {
          this.funcionarios =
            this.criarListaGestao(
              resultado.funcionarios,
              resultado.registros
            );

          this.carregando = false;
          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao carregar funcionários:',
            erro
          );

          this.erroCarregamento =
            this.obterMensagemErro(
              erro,
              'Não foi possível carregar os funcionários.'
            );

          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  abrirDetalhes(
    funcionario: FuncionarioGestao
  ): void {
    this.funcionarioSelecionado =
      funcionario;

    this.statusSelecionado =
      funcionario.dados.status;

    this.modoModal = 'detalhes';
    this.erroModal = '';
    this.confirmarDesativacao = false;
  }

  abrirEdicao(
    funcionario?: FuncionarioGestao
  ): void {
    const selecionado =
      funcionario ??
      this.funcionarioSelecionado;

    if (!this.ehRh || !selecionado) {
      return;
    }

    this.funcionarioSelecionado =
      selecionado;

    this.formulario =
      this.criarFormulario(
        selecionado.dados
      );

    this.modoModal = 'edicao';
    this.erroModal = '';
    this.confirmarDesativacao = false;
  }

  voltarParaDetalhes(): void {
    if (this.processando) {
      return;
    }

    this.modoModal = 'detalhes';
    this.erroModal = '';
  }

  fecharModal(): void {
    if (this.processando) {
      return;
    }

    this.funcionarioSelecionado = null;
    this.modoModal = null;
    this.erroModal = '';
    this.confirmarDesativacao = false;
    this.formulario =
      this.criarFormularioVazio();
  }

  salvarEdicao(): void {
    const selecionado =
      this.funcionarioSelecionado;

    if (
      !this.ehRh ||
      !selecionado ||
      this.processando
    ) {
      return;
    }

    this.erroModal = '';

    const erroValidacao =
      this.validarFormulario();

    if (erroValidacao) {
      this.erroModal =
        erroValidacao;

      return;
    }

    const request =
      this.criarUpdateRequest();

    this.processando = true;

    this.funcionarioService
      .atualizar(
        selecionado.dados.id,
        request
      )
      .pipe(timeout(10000))
      .subscribe({
        next: (
          atualizado:
            FuncionarioResponse
        ) => {
          this.atualizarFuncionarioLocal(
            atualizado
          );

          this.mensagemFeedback =
            'Funcionário atualizado com sucesso.';

          this.processando = false;

          const itemAtualizado =
            this.localizarFuncionario(
              atualizado.id
            );

          this.funcionarioSelecionado =
            itemAtualizado;

          this.statusSelecionado =
            atualizado.status;

          this.modoModal = 'detalhes';
          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao atualizar funcionário:',
            erro
          );

          this.erroModal =
            this.obterMensagemErro(
              erro,
              'Não foi possível atualizar o funcionário.'
            );

          this.processando = false;
          this.cdr.detectChanges();
        },
      });
  }

  alterarStatus(): void {
    const selecionado =
      this.funcionarioSelecionado;

    if (
      !this.ehRh ||
      !selecionado ||
      this.processando
    ) {
      return;
    }

    if (
      selecionado.dados.status ===
      this.statusSelecionado
    ) {
      this.erroModal =
        'Selecione um status diferente do atual.';

      return;
    }

    if (
      selecionado.dados.id ===
      this.usuarioLogadoId &&
      this.statusSelecionado ===
      'Inativo'
    ) {
      this.erroModal =
        'Você não pode inativar o próprio usuário.';

      return;
    }

    this.processando = true;
    this.erroModal = '';

    this.funcionarioService
      .alterarStatus(
        selecionado.dados.id,
        this.statusSelecionado
      )
      .pipe(timeout(10000))
      .subscribe({
        next: (
          atualizado:
            FuncionarioResponse
        ) => {
          this.atualizarFuncionarioLocal(
            atualizado
          );

          this.mensagemFeedback =
            'Status atualizado com sucesso.';

          this.processando = false;

          this.funcionarioSelecionado =
            this.localizarFuncionario(
              atualizado.id
            );

          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao alterar status:',
            erro
          );

          this.erroModal =
            this.obterMensagemErro(
              erro,
              'Não foi possível alterar o status.'
            );

          this.processando = false;
          this.cdr.detectChanges();
        },
      });
  }

  solicitarDesativacao(): void {
    if (!this.podeDesativarSelecionado) {
      return;
    }

    this.confirmarDesativacao = true;
    this.erroModal = '';
  }

  cancelarDesativacao(): void {
    if (this.processando) {
      return;
    }

    this.confirmarDesativacao = false;
  }

  desativarFuncionario(): void {
    const selecionado =
      this.funcionarioSelecionado;

    if (
      !selecionado ||
      !this.podeDesativarSelecionado ||
      this.processando
    ) {
      return;
    }

    this.processando = true;
    this.erroModal = '';

    this.funcionarioService
      .desativar(
        selecionado.dados.id
      )
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          const dadosAtualizados:
            FuncionarioResponse = {
            ...selecionado.dados,
            status: 'Inativo',
          };

          this.atualizarFuncionarioLocal(
            dadosAtualizados
          );

          this.mensagemFeedback =
            'Funcionário desativado com sucesso.';

          this.processando = false;
          this.confirmarDesativacao = false;

          this.funcionarioSelecionado =
            this.localizarFuncionario(
              dadosAtualizados.id
            );

          this.statusSelecionado =
            'Inativo';

          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao desativar funcionário:',
            erro
          );

          this.erroModal =
            this.obterMensagemErro(
              erro,
              'Não foi possível desativar o funcionário.'
            );

          this.processando = false;
          this.cdr.detectChanges();
        },
      });
  }

  limparFiltros(): void {
    this.filtroBusca = '';
    this.filtroStatus = 'Todos';
    this.filtroSetor = 'Todos';
    this.filtroAcesso = 'Todos';
  }

  statusClasse(
    status: StatusFuncionario
  ): string {
    const classes: Record<
      StatusFuncionario,
      string
    > = {
      Ativo:
        'text-bg-success',

      Férias:
        'text-bg-warning',

      Afastado:
        'text-bg-info',

      Inativo:
        'text-bg-secondary',
    };

    return classes[status];
  }

  acessoClasse(
  tipo: TipoUsuario
): string {
  const classes:
    Record<TipoUsuario, string> = {
    funcionario:
      'badge-acesso badge-acesso-funcionario',

    gestor:
      'badge-acesso badge-acesso-gestor',

    rh:
      'badge-acesso badge-acesso-rh',
  };

  return classes[tipo];
}

  nomeTipoAcesso(
    tipo: TipoUsuario
  ): string {
    const nomes:
      Record<TipoUsuario, string> = {
      funcionario:
        'Funcionário',

      gestor:
        'Gestor',

      rh:
        'RH',
    };

    return nomes[tipo];
  }

  iniciais(nome: string): string {
    return nome
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (parte: string): string =>
          parte.charAt(0).toUpperCase()
      )
      .join('');
  }

  formatarData(
    valor: string | null
  ): string {
    if (!valor) {
      return 'Não informado';
    }

    const partes =
      valor.substring(0, 10).split('-');

    if (partes.length !== 3) {
      return valor;
    }

    return (
      `${partes[2]}/` +
      `${partes[1]}/` +
      `${partes[0]}`
    );
  }

  valorOuNaoInformado(
    valor:
      string | number | null
  ): string {
    if (
      valor === null ||
      valor === ''
    ) {
      return 'Não informado';
    }

    return String(valor);
  }

  trackByFuncionario(
    _index: number,
    item: FuncionarioGestao
  ): number {
    return item.dados.id;
  }

  private criarListaGestao(
    funcionarios: FuncionarioResponse[],
    registros: RegistroPontoResponse[]
  ): FuncionarioGestao[] {

    const estatisticas =
      new Map<
        number,
        EstatisticasFuncionario
      >();

    registros.forEach(
      (
        registro:
          RegistroPontoResponse
      ): void => {

        const atual =
          estatisticas.get(
            registro.funcionarioId
          ) ?? {
            totalRegistros: 0,
            atrasos: 0,
            faltas: 0,
            pendencias: 0,
          };

        atual.totalRegistros += 1;

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
          registro.status ===
          'PENDENTE'
        ) {
          atual.pendencias += 1;
        }

        estatisticas.set(
          registro.funcionarioId,
          atual
        );
      }
    );

    return funcionarios
      .map(
        (
          dados: FuncionarioResponse
        ): FuncionarioGestao => ({
          dados,
          estatisticas:
            estatisticas.get(
              dados.id
            ) ?? {
              totalRegistros: 0,
              atrasos: 0,
              faltas: 0,
              pendencias: 0,
            },
        })
      )
      .sort(
        (
          a: FuncionarioGestao,
          b: FuncionarioGestao
        ): number =>
          a.dados.nomeCompleto
            .localeCompare(
              b.dados.nomeCompleto,
              'pt-BR'
            )
      );
  }

  private criarFormulario(
    funcionario:
      FuncionarioResponse
  ): FormularioFuncionario {

    return {
      nomeCompleto:
        funcionario.nomeCompleto,

      emailCorporativo:
        funcionario.emailCorporativo,

      cpf:
        funcionario.cpf ?? '',

      telefone:
        funcionario.telefone ?? '',

      dataNascimento:
        funcionario.dataNascimento ?? '',

      estadoCivil:
        funcionario.estadoCivil ?? '',

      nacionalidade:
        funcionario.nacionalidade ?? '',

      naturalidade:
        funcionario.naturalidade ?? '',

      matricula:
        funcionario.matricula,

      cargo:
        funcionario.cargo,

      setor:
        funcionario.setor,

      dataAdmissao:
        funcionario.dataAdmissao ?? '',

      tipoVinculo:
        funcionario.tipoVinculo ?? '',

      cargaHorariaSemanal:
        funcionario
          .cargaHorariaSemanal,

      gestorImediato:
        funcionario
          .gestorImediato ?? '',

      localTrabalho:
        funcionario
          .localTrabalho ?? '',

      tipoAcesso:
        funcionario.tipoAcesso,

      status:
        funcionario.status,
    };
  }

  private criarFormularioVazio():
    FormularioFuncionario {

    return {
      nomeCompleto: '',
      emailCorporativo: '',
      cpf: '',
      telefone: '',
      dataNascimento: '',
      estadoCivil: '',
      nacionalidade: '',
      naturalidade: '',
      matricula: '',
      cargo: '',
      setor: '',
      dataAdmissao: '',
      tipoVinculo: '',
      cargaHorariaSemanal: null,
      gestorImediato: '',
      localTrabalho: '',
      tipoAcesso: 'funcionario',
      status: 'Ativo',
    };
  }

  private validarFormulario():
    string {

    const obrigatorios: Array<{
      valor: string;
      nome: string;
    }> = [
        {
          valor:
            this.formulario
              .nomeCompleto,
          nome: 'nome completo',
        },
        {
          valor:
            this.formulario
              .emailCorporativo,
          nome: 'e-mail corporativo',
        },
        {
          valor:
            this.formulario.cpf,
          nome: 'CPF',
        },
        {
          valor:
            this.formulario.telefone,
          nome: 'telefone',
        },
        {
          valor:
            this.formulario
              .dataNascimento,
          nome: 'data de nascimento',
        },
        {
          valor:
            this.formulario
              .nacionalidade,
          nome: 'nacionalidade',
        },
        {
          valor:
            this.formulario.matricula,
          nome: 'matrícula',
        },
        {
          valor:
            this.formulario.cargo,
          nome: 'cargo',
        },
        {
          valor:
            this.formulario.setor,
          nome: 'setor',
        },
        {
          valor:
            this.formulario
              .dataAdmissao,
          nome: 'data de admissão',
        },
        {
          valor:
            this.formulario
              .tipoVinculo,
          nome: 'tipo de vínculo',
        },
      ];

    const ausente =
      obrigatorios.find(
        (
          campo: {
            valor: string;
            nome: string;
          }
        ): boolean =>
          !campo.valor.trim()
      );

    if (ausente) {
      return (
        `Informe o campo obrigatório: ` +
        `${ausente.nome}.`
      );
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailValido.test(
        this.formulario
          .emailCorporativo
          .trim()
      )
    ) {
      return 'Informe um e-mail válido.';
    }

    const cpfValido =
      /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

    if (
      !cpfValido.test(
        this.formulario.cpf.trim()
      )
    ) {
      return 'Informe um CPF válido.';
    }

    const carga =
      this.formulario
        .cargaHorariaSemanal;

    if (
      carga !== null &&
      (carga < 1 || carga > 60)
    ) {
      return (
        'A carga horária deve estar ' +
        'entre 1 e 60 horas.'
      );
    }

    return '';
  }

  private criarUpdateRequest():
    FuncionarioUpdateRequest {

    return {
      nomeCompleto:
        this.formulario
          .nomeCompleto.trim(),

      emailCorporativo:
        this.formulario
          .emailCorporativo.trim(),

      cpf:
        this.formulario.cpf.trim(),

      telefone:
        this.formulario.telefone.trim(),

      dataNascimento:
        this.formulario.dataNascimento,

      estadoCivil:
        this.valorOpcional(
          this.formulario.estadoCivil
        ),

      nacionalidade:
        this.formulario
          .nacionalidade.trim(),

      naturalidade:
        this.valorOpcional(
          this.formulario.naturalidade
        ),

      matricula:
        this.formulario
          .matricula.trim(),

      cargo:
        this.formulario.cargo.trim(),

      setor:
        this.formulario.setor.trim(),

      dataAdmissao:
        this.formulario.dataAdmissao,

      tipoVinculo:
        this.formulario
          .tipoVinculo as TipoVinculo,

      cargaHorariaSemanal:
        this.formulario
          .cargaHorariaSemanal,

      gestorImediato:
        this.valorOpcional(
          this.formulario
            .gestorImediato
        ),

      localTrabalho:
        this.valorOpcional(
          this.formulario
            .localTrabalho
        ),

      tipoAcesso:
        this.formulario.tipoAcesso,

      status:
        this.formulario.status,
    };
  }

  private atualizarFuncionarioLocal(
    atualizado:
      FuncionarioResponse
  ): void {

    this.funcionarios =
      this.funcionarios.map(
        (
          item: FuncionarioGestao
        ): FuncionarioGestao =>
          item.dados.id ===
            atualizado.id
            ? {
              ...item,
              dados: atualizado,
            }
            : item
      );
  }

  private localizarFuncionario(
    id: number
  ): FuncionarioGestao | null {
    return (
      this.funcionarios.find(
        (
          item: FuncionarioGestao
        ): boolean =>
          item.dados.id === id
      ) ?? null
    );
  }

  private contarStatus(
    status: StatusFuncionario
  ): number {
    return this.funcionarios.filter(
      (
        item: FuncionarioGestao
      ): boolean =>
        item.dados.status === status
    ).length;
  }

  private valorOpcional(
    valor: string
  ): string | null {
    const normalizado =
      valor.trim();

    return normalizado || null;
  }

  private obterPrimeiroDiaMes():
    string {

    const data = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    return this.formatarDataISO(data);
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

      if (
        typeof erro.error?.erro ===
        'string'
      ) {
        return erro.error.erro;
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