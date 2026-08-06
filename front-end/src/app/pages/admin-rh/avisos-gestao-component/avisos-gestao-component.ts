import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';

import { AvisoService } from '../../../core/services/aviso.service';
import { UsuarioLogadoService } from '../../../core/services/usuario-logado.service';
import {
  AvisoRequest,
  AvisoResponse,
  DestinoAviso,
  NivelAviso,
  TipoAcessoAviso,
} from '../../../models/aviso';

type FiltroAtivo =
  | 'Todos'
  | 'Ativos'
  | 'Inativos';

type StatusPublicacao =
  | 'Ativo'
  | 'Agendado'
  | 'Expirado'
  | 'Inativo';

interface FormularioAviso {
  titulo: string;
  mensagem: string;
  nivel: NivelAviso;
  destino: DestinoAviso;
  tipoAcessoAlvo: TipoAcessoAviso | '';
  setorAlvo: string;
  publicadoEm: string;
  expiraEm: string;
}

interface ResumoAvisoGestao {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo:
    | 'neutro'
    | 'positivo'
    | 'atencao'
    | 'perigo';
}

@Component({
  selector: 'app-avisos-gestao-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl:
    './avisos-gestao-component.html',
  styleUrl:
    './avisos-gestao-component.css',
})
export class AvisosGestaoComponent
  implements OnInit {

  avisos: AvisoResponse[] = [];

  filtroBusca = '';
  filtroNivel = 'Todos';
  filtroDestino = 'Todos';
  filtroAtivo: FiltroAtivo = 'Todos';

  carregando = true;
  salvando = false;
  excluindo = false;

  erroCarregamento = '';
  erroFormulario = '';
  mensagemFeedback = '';

  ehRh = false;
  modoEdicao = false;
  avisoEditandoId: number | null = null;
  avisoParaExcluir: AvisoResponse | null = null;

  formulario: FormularioAviso =
    this.criarFormularioVazio();

  readonly niveis: Array<
    'Todos' | NivelAviso
  > = [
    'Todos',
    'INFORMATIVO',
    'SUCESSO',
    'ALERTA',
    'URGENTE',
  ];

  readonly destinos: Array<
    'Todos' | DestinoAviso
  > = [
    'Todos',
    'TODOS',
    'TIPO_ACESSO',
    'SETOR',
  ];

  readonly tiposAcesso:
    TipoAcessoAviso[] = [
      'FUNCIONARIO',
      'RH',
      'GESTOR',
    ];

  constructor(
    private readonly avisoService:
      AvisoService,

    private readonly usuarioLogadoService:
      UsuarioLogadoService,

    private readonly cdr:
      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ehRh =
      this.usuarioLogadoService
        .obterTipoUsuario() === 'rh';

    this.carregarAvisos();
  }

  get avisosFiltrados(): AvisoResponse[] {
    const busca =
      this.normalizarTexto(
        this.filtroBusca
      );

    return this.avisos.filter(
      (aviso: AvisoResponse) => {
        const correspondeBusca =
          !busca ||
          [
            aviso.titulo,
            aviso.mensagem,
            aviso.nomeCriadoPor,
            aviso.setorAlvo ?? '',
            aviso.tipoAcessoAlvo ?? '',
          ]
            .map((valor: string) =>
              this.normalizarTexto(valor)
            )
            .some((valor: string) =>
              valor.includes(busca)
            );

        const correspondeNivel =
          this.filtroNivel === 'Todos' ||
          aviso.nivel ===
            this.filtroNivel;

        const correspondeDestino =
          this.filtroDestino === 'Todos' ||
          aviso.destino ===
            this.filtroDestino;

        const correspondeAtivo =
          this.filtroAtivo === 'Todos' ||
          (
            this.filtroAtivo === 'Ativos' &&
            aviso.ativo
          ) ||
          (
            this.filtroAtivo === 'Inativos' &&
            !aviso.ativo
          );

        return (
          correspondeBusca &&
          correspondeNivel &&
          correspondeDestino &&
          correspondeAtivo
        );
      }
    );
  }

  get totalAtivos(): number {
    return this.avisos.filter(
      (aviso: AvisoResponse) =>
        this.statusPublicacao(aviso) ===
        'Ativo'
    ).length;
  }

  get totalAgendados(): number {
    return this.avisos.filter(
      (aviso: AvisoResponse) =>
        this.statusPublicacao(aviso) ===
        'Agendado'
    ).length;
  }

  get totalUrgentes(): number {
    return this.avisos.filter(
      (aviso: AvisoResponse) =>
        aviso.nivel === 'URGENTE' &&
        aviso.ativo &&
        this.statusPublicacao(aviso) !==
          'Expirado'
    ).length;
  }

  get totalExpirados(): number {
    return this.avisos.filter(
      (aviso: AvisoResponse) =>
        this.statusPublicacao(aviso) ===
        'Expirado'
    ).length;
  }

  get resumo(): ResumoAvisoGestao[] {
    return [
      {
        titulo: 'Avisos cadastrados',
        valor: String(this.avisos.length),
        detalhe:
          'Total disponível na gestão',
        icone: 'bi-megaphone',
        tipo: 'neutro',
      },
      {
        titulo: 'Publicados',
        valor: String(this.totalAtivos),
        detalhe:
          'Visíveis para os destinatários',
        icone: 'bi-broadcast',
        tipo: 'positivo',
      },
      {
        titulo: 'Agendados',
        valor: String(this.totalAgendados),
        detalhe:
          'Aguardando data de publicação',
        icone: 'bi-calendar-event',
        tipo: 'atencao',
      },
      {
        titulo: 'Urgentes',
        valor: String(this.totalUrgentes),
        detalhe:
          `${this.totalExpirados} aviso(s) expirado(s)`,
        icone:
          'bi-exclamation-octagon',
        tipo:
          this.totalUrgentes > 0
            ? 'perigo'
            : 'positivo',
      },
    ];
  }

  carregarAvisos(): void {
    this.carregando = true;
    this.erroCarregamento = '';
    this.mensagemFeedback = '';

    this.avisoService
      .listarGerencial()
      .pipe(timeout(10000))
      .subscribe({
        next: (
          avisos: AvisoResponse[]
        ) => {
          this.avisos = avisos;
          this.carregando = false;
          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao carregar avisos:',
            erro
          );

          this.erroCarregamento =
            this.obterMensagemErro(
              erro,
              'Não foi possível carregar os avisos.'
            );

          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  salvarAviso(): void {
    if (!this.ehRh || this.salvando) {
      return;
    }

    this.erroFormulario = '';
    this.mensagemFeedback = '';

    const erroValidacao =
      this.validarFormulario();

    if (erroValidacao) {
      this.erroFormulario =
        erroValidacao;

      return;
    }

    const request =
      this.criarRequest();

    this.salvando = true;

    const operacao =
      this.modoEdicao &&
      this.avisoEditandoId !== null

        ? this.avisoService.atualizar(
            this.avisoEditandoId,
            request
          )

        : this.avisoService.criar(
            request
          );

    operacao
      .pipe(timeout(10000))
      .subscribe({
        next: (
          avisoSalvo: AvisoResponse
        ) => {
          if (this.modoEdicao) {
            this.avisos =
              this.avisos.map(
                (
                  aviso: AvisoResponse
                ): AvisoResponse =>
                  aviso.id ===
                  avisoSalvo.id
                    ? avisoSalvo
                    : aviso
              );

            this.mensagemFeedback =
              'Aviso atualizado com sucesso.';
          } else {
            this.avisos = [
              avisoSalvo,
              ...this.avisos,
            ];

            this.mensagemFeedback =
              'Aviso publicado com sucesso.';
          }

          this.salvando = false;
          this.cancelarEdicao();
          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao salvar aviso:',
            erro
          );

          this.erroFormulario =
            this.obterMensagemErro(
              erro,
              'Não foi possível salvar o aviso.'
            );

          this.salvando = false;
          this.cdr.detectChanges();
        },
      });
  }

  editarAviso(
    aviso: AvisoResponse
  ): void {
    if (!this.ehRh || this.salvando) {
      return;
    }

    this.modoEdicao = true;
    this.avisoEditandoId = aviso.id;
    this.erroFormulario = '';
    this.mensagemFeedback = '';

    this.formulario = {
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      nivel: aviso.nivel,
      destino: aviso.destino,

      tipoAcessoAlvo:
        aviso.tipoAcessoAlvo ?? '',

      setorAlvo:
        aviso.setorAlvo ?? '',

      publicadoEm:
        this.paraInputDataHora(
          aviso.publicadoEm
        ),

      expiraEm:
        aviso.expiraEm
          ? this.paraInputDataHora(
              aviso.expiraEm
            )
          : '',
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  cancelarEdicao(): void {
    this.modoEdicao = false;
    this.avisoEditandoId = null;
    this.erroFormulario = '';

    this.formulario =
      this.criarFormularioVazio();
  }

  aoAlterarDestino(): void {
    if (
      this.formulario.destino !==
      'TIPO_ACESSO'
    ) {
      this.formulario.tipoAcessoAlvo =
        '';
    }

    if (
      this.formulario.destino !==
      'SETOR'
    ) {
      this.formulario.setorAlvo = '';
    }
  }

  solicitarExclusao(
    aviso: AvisoResponse
  ): void {
    if (!this.ehRh || this.excluindo) {
      return;
    }

    this.avisoParaExcluir = aviso;
  }

  cancelarExclusao(): void {
    if (this.excluindo) {
      return;
    }

    this.avisoParaExcluir = null;
  }

  confirmarExclusao(): void {
    const aviso =
      this.avisoParaExcluir;

    if (
      !this.ehRh ||
      !aviso ||
      this.excluindo
    ) {
      return;
    }

    this.excluindo = true;
    this.mensagemFeedback = '';

    this.avisoService
      .excluir(aviso.id)
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.avisos =
            this.avisos.filter(
              (
                item: AvisoResponse
              ): boolean =>
                item.id !== aviso.id
            );

          if (
            this.avisoEditandoId ===
            aviso.id
          ) {
            this.cancelarEdicao();
          }

          this.mensagemFeedback =
            'Aviso excluído com sucesso.';

          this.avisoParaExcluir = null;
          this.excluindo = false;
          this.cdr.detectChanges();
        },

        error: (erro: unknown) => {
          console.error(
            'Erro ao excluir aviso:',
            erro
          );

          this.erroCarregamento =
            this.obterMensagemErro(
              erro,
              'Não foi possível excluir o aviso.'
            );

          this.avisoParaExcluir = null;
          this.excluindo = false;
          this.cdr.detectChanges();
        },
      });
  }

  limparFiltros(): void {
    this.filtroBusca = '';
    this.filtroNivel = 'Todos';
    this.filtroDestino = 'Todos';
    this.filtroAtivo = 'Todos';
  }

  statusPublicacao(
    aviso: AvisoResponse
  ): StatusPublicacao {
    if (!aviso.ativo) {
      return 'Inativo';
    }

    const agora = new Date();
    const publicacao =
      new Date(aviso.publicadoEm);

    if (publicacao > agora) {
      return 'Agendado';
    }

    if (
      aviso.expiraEm &&
      new Date(aviso.expiraEm) <= agora
    ) {
      return 'Expirado';
    }

    return 'Ativo';
  }

  classeStatus(
    aviso: AvisoResponse
  ): string {
    const classes: Record<
      StatusPublicacao,
      string
    > = {
      Ativo:
        'text-bg-success',

      Agendado:
        'text-bg-warning',

      Expirado:
        'text-bg-secondary',

      Inativo:
        'text-bg-dark',
    };

    return classes[
      this.statusPublicacao(aviso)
    ];
  }

  classeNivel(
    nivel: NivelAviso
  ): string {
    const classes:
      Record<NivelAviso, string> = {

      INFORMATIVO:
        'nivel-informativo',

      SUCESSO:
        'nivel-sucesso',

      ALERTA:
        'nivel-alerta',

      URGENTE:
        'nivel-urgente',
    };

    return classes[nivel];
  }

  iconeNivel(
    nivel: NivelAviso
  ): string {
    const icones:
      Record<NivelAviso, string> = {

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

  nomeNivel(
    nivel: NivelAviso
  ): string {
    const nomes:
      Record<NivelAviso, string> = {

      INFORMATIVO:
        'Informativo',

      SUCESSO:
        'Sucesso',

      ALERTA:
        'Alerta',

      URGENTE:
        'Urgente',
    };

    return nomes[nivel];
  }

  nomeDestino(
    aviso: AvisoResponse
  ): string {
    switch (aviso.destino) {
      case 'TODOS':
        return 'Toda a empresa';

      case 'TIPO_ACESSO':
        return aviso.tipoAcessoAlvo
          ? this.nomeTipoAcesso(
              aviso.tipoAcessoAlvo
            )
          : 'Perfil específico';

      case 'SETOR':
        return aviso.setorAlvo
          ? `Setor: ${aviso.setorAlvo}`
          : 'Setor específico';
    }
  }

  nomeTipoAcesso(
    tipo: TipoAcessoAviso
  ): string {
    const nomes:
      Record<TipoAcessoAviso, string> = {

      FUNCIONARIO:
        'Funcionários',

      RH:
        'Recursos Humanos',

      GESTOR:
        'Gestores',
    };

    return nomes[tipo];
  }

  formatarDataHora(
    valor: string | null
  ): string {
    if (!valor) {
      return 'Sem expiração';
    }

    const data = new Date(valor);

    return data.toLocaleString(
      'pt-BR',
      {
        dateStyle: 'short',
        timeStyle: 'short',
      }
    );
  }

  trackById(
    _index: number,
    aviso: AvisoResponse
  ): number {
    return aviso.id;
  }

  private criarFormularioVazio():
    FormularioAviso {

    return {
      titulo: '',
      mensagem: '',
      nivel: 'INFORMATIVO',
      destino: 'TODOS',
      tipoAcessoAlvo: '',
      setorAlvo: '',
      publicadoEm: '',
      expiraEm: '',
    };
  }

  private validarFormulario():
    string {

    const titulo =
      this.formulario.titulo.trim();

    const mensagem =
      this.formulario.mensagem.trim();

    if (
      titulo.length < 3 ||
      titulo.length > 150
    ) {
      return (
        'O título deve possuir entre ' +
        '3 e 150 caracteres.'
      );
    }

    if (
      mensagem.length < 5 ||
      mensagem.length > 3000
    ) {
      return (
        'A mensagem deve possuir entre ' +
        '5 e 3000 caracteres.'
      );
    }

    if (
      this.formulario.destino ===
        'TIPO_ACESSO' &&
      !this.formulario.tipoAcessoAlvo
    ) {
      return (
        'Selecione o tipo de acesso ' +
        'que receberá o aviso.'
      );
    }

    if (
      this.formulario.destino ===
        'SETOR' &&
      !this.formulario.setorAlvo.trim()
    ) {
      return (
        'Informe o setor que receberá ' +
        'o aviso.'
      );
    }

    if (
      this.formulario.expiraEm
    ) {
      const publicacao =
        this.formulario.publicadoEm
          ? new Date(
              this.formulario.publicadoEm
            )
          : new Date();

      const expiracao =
        new Date(
          this.formulario.expiraEm
        );

      if (expiracao <= publicacao) {
        return (
          'A expiração deve ser posterior ' +
          'à publicação.'
        );
      }
    }

    return '';
  }

  private criarRequest():
    AvisoRequest {

    const request: AvisoRequest = {
      titulo:
        this.formulario.titulo.trim(),

      mensagem:
        this.formulario.mensagem.trim(),

      nivel:
        this.formulario.nivel,

      destino:
        this.formulario.destino,
    };

    if (
      this.formulario.destino ===
        'TIPO_ACESSO' &&
      this.formulario.tipoAcessoAlvo
    ) {
      request.tipoAcessoAlvo =
        this.formulario
          .tipoAcessoAlvo;
    }

    if (
      this.formulario.destino ===
      'SETOR'
    ) {
      request.setorAlvo =
        this.formulario
          .setorAlvo
          .trim();
    }

    if (
      this.formulario.publicadoEm
    ) {
      request.publicadoEm =
        this.normalizarDataHora(
          this.formulario.publicadoEm
        );
    }

    if (
      this.formulario.expiraEm
    ) {
      request.expiraEm =
        this.normalizarDataHora(
          this.formulario.expiraEm
        );
    }

    return request;
  }

  private normalizarDataHora(
    valor: string
  ): string {
    return valor.length === 16
      ? `${valor}:00`
      : valor;
  }

  private paraInputDataHora(
    valor: string
  ): string {
    return valor.substring(0, 16);
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