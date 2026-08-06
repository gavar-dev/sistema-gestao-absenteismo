import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {ChangeDetectorRef,Component,OnInit,} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';

import { AvisoService } from '../../../core/services/aviso.service';
import { UsuarioLogadoService } from '../../../core/services/usuario-logado.service';
import {AvisoResponse,DestinoAviso,NivelAviso,TipoAcessoAviso,} from '../../../models/aviso';

type TipoAvisoVisual =
  | 'info'
  | 'warning'
  | 'success'
  | 'danger';

type RotuloNivel =
  | 'Informativo'
  | 'Sucesso'
  | 'Alerta'
  | 'Urgente';

interface AvisoFuncionario {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  tipo: TipoAvisoVisual;
  nivel: NivelAviso;
  rotuloNivel: RotuloNivel;
  destino: string;
  icone: string;
  lido: boolean;
  autor: string;
  expiracao: string | null;
}

interface ResumoAviso {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo:
    | 'neutro'
    | 'atencao'
    | 'positivo'
    | 'perigo';
}

@Component({
  selector: 'app-aviso-componente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aviso-componente.html',
  styleUrl: './aviso-componente.css',
})
export class AvisoComponente implements OnInit {
  filtroNivel = 'Todos';
  filtroLeitura = 'Todos';
  filtroBusca = '';

  readonly niveis: Array<
    'Todos' | RotuloNivel
  > = [
    'Todos',
    'Informativo',
    'Sucesso',
    'Alerta',
    'Urgente',
  ];

  readonly estadosLeitura = [
    'Todos',
    'Não lidos',
    'Lidos',
  ];

  avisos: AvisoFuncionario[] = [];

  carregando = true;
  erro = '';

  private idsLidos = new Set<number>();

  constructor(
    private readonly avisoService: AvisoService,
    private readonly usuarioLogadoService:
      UsuarioLogadoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idsLidos = this.carregarIdsLidos();
    this.carregarAvisos();
  }

  get naoLidos(): number {
    return this.avisos.filter(
      (aviso: AvisoFuncionario) => !aviso.lido
    ).length;
  }

  get urgentes(): number {
    return this.avisos.filter(
      (aviso: AvisoFuncionario) =>
        aviso.nivel === 'URGENTE' &&
        !aviso.lido
    ).length;
  }

  get sucessos(): number {
    return this.avisos.filter(
      (aviso: AvisoFuncionario) =>
        aviso.nivel === 'SUCESSO'
    ).length;
  }

  get resumo(): ResumoAviso[] {
    return [
      {
        titulo: 'Total de avisos',
        valor: String(this.avisos.length),
        detalhe:
          'Ativos e destinados ao seu perfil',
        icone: 'bi-bell',
        tipo: 'neutro',
      },
      {
        titulo: 'Não lidos',
        valor: String(this.naoLidos),
        detalhe: 'Precisam da sua atenção',
        icone: 'bi-envelope-exclamation',
        tipo:
          this.naoLidos > 0
            ? 'atencao'
            : 'positivo',
      },
      {
        titulo: 'Urgentes',
        valor: String(this.urgentes),
        detalhe: 'Com prioridade máxima',
        icone: 'bi-exclamation-octagon',
        tipo:
          this.urgentes > 0
            ? 'perigo'
            : 'positivo',
      },
      {
        titulo: 'Confirmações',
        valor: String(this.sucessos),
        detalhe: 'Avisos de sucesso publicados',
        icone: 'bi-check2-circle',
        tipo: 'positivo',
      },
    ];
  }

  get avisosFiltrados(): AvisoFuncionario[] {
    const busca =
      this.filtroBusca.trim().toLowerCase();

    return this.avisos.filter(
      (aviso: AvisoFuncionario) => {
        const nivelConfere =
          this.filtroNivel === 'Todos' ||
          aviso.rotuloNivel ===
            this.filtroNivel;

        const leituraConfere =
          this.filtroLeitura === 'Todos' ||
          (this.filtroLeitura ===
            'Não lidos' &&
            !aviso.lido) ||
          (this.filtroLeitura === 'Lidos' &&
            aviso.lido);

        const buscaConfere =
          !busca ||
          aviso.titulo
            .toLowerCase()
            .includes(busca) ||
          aviso.descricao
            .toLowerCase()
            .includes(busca) ||
          aviso.rotuloNivel
            .toLowerCase()
            .includes(busca) ||
          aviso.destino
            .toLowerCase()
            .includes(busca) ||
          aviso.autor
            .toLowerCase()
            .includes(busca);

        return (
          nivelConfere &&
          leituraConfere &&
          buscaConfere
        );
      }
    );
  }

  carregarAvisos(): void {
    this.carregando = true;
    this.erro = '';

    this.avisoService
      .listarMeus()
      .pipe(timeout(10000))
      .subscribe({
        next: (
          resposta: AvisoResponse[]
        ) => {
          this.avisos = resposta.map(
            (
              aviso: AvisoResponse
            ): AvisoFuncionario =>
              this.mapearAviso(aviso)
          );

          this.removerIdsInexistentes();
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: (erro: unknown) => {
          console.error(
            'Erro ao carregar avisos:',
            erro
          );

          this.erro =
            this.obterMensagemErro(
              erro,
              'Não foi possível carregar os avisos.'
            );

          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  marcarComoLido(
    aviso: AvisoFuncionario
  ): void {
    if (aviso.lido) {
      return;
    }

    aviso.lido = true;
    this.idsLidos.add(aviso.id);
    this.salvarIdsLidos();
  }

  marcarTodosComoLidos(): void {
    this.avisos = this.avisos.map(
      (
        aviso: AvisoFuncionario
      ): AvisoFuncionario => {
        this.idsLidos.add(aviso.id);

        return {
          ...aviso,
          lido: true,
        };
      }
    );

    this.salvarIdsLidos();
  }

  limparFiltros(): void {
    this.filtroNivel = 'Todos';
    this.filtroLeitura = 'Todos';
    this.filtroBusca = '';
  }

  classeTipo(
    tipo: TipoAvisoVisual
  ): string {
    return `aviso-item-${tipo}`;
  }

  rotuloTipo(
    tipo: TipoAvisoVisual
  ): string {
    const rotulos: Record<
      TipoAvisoVisual,
      string
    > = {
      info: 'Informação',
      warning: 'Atenção',
      success: 'Confirmação',
      danger: 'Urgente',
    };

    return rotulos[tipo];
  }

  trackByAviso(
    _index: number,
    aviso: AvisoFuncionario
  ): number {
    return aviso.id;
  }

  private mapearAviso(
    aviso: AvisoResponse
  ): AvisoFuncionario {
    const visual =
      this.obterVisualNivel(aviso.nivel);

    const dataHora =
      this.formatarDataHora(
        aviso.publicadoEm
      );

    return {
      id: aviso.id,
      titulo: aviso.titulo,
      descricao: aviso.mensagem,
      data: dataHora.data,
      horario: dataHora.horario,
      tipo: visual.tipo,
      nivel: aviso.nivel,
      rotuloNivel: visual.rotulo,
      destino: this.formatarDestino(aviso),
      icone: visual.icone,
      lido: this.idsLidos.has(aviso.id),
      autor: aviso.nomeCriadoPor,
      expiracao: aviso.expiraEm
        ? this.formatarExpiracao(
            aviso.expiraEm
          )
        : null,
    };
  }

  private obterVisualNivel(
    nivel: NivelAviso
  ): {
    tipo: TipoAvisoVisual;
    rotulo: RotuloNivel;
    icone: string;
  } {
    const visuais: Record<
      NivelAviso,
      {
        tipo: TipoAvisoVisual;
        rotulo: RotuloNivel;
        icone: string;
      }
    > = {
      INFORMATIVO: {
        tipo: 'info',
        rotulo: 'Informativo',
        icone: 'bi-info-circle',
      },
      SUCESSO: {
        tipo: 'success',
        rotulo: 'Sucesso',
        icone: 'bi-check-circle',
      },
      ALERTA: {
        tipo: 'warning',
        rotulo: 'Alerta',
        icone:
          'bi-exclamation-triangle',
      },
      URGENTE: {
        tipo: 'danger',
        rotulo: 'Urgente',
        icone: 'bi-exclamation-octagon',
      },
    };

    return visuais[nivel];
  }

  private formatarDestino(
    aviso: AvisoResponse
  ): string {
    const destinos: Record<
      DestinoAviso,
      string
    > = {
      TODOS: 'Toda a empresa',
      TIPO_ACESSO:
        this.nomeTipoAcesso(
          aviso.tipoAcessoAlvo
        ),
      SETOR: aviso.setorAlvo
        ? `Setor: ${aviso.setorAlvo}`
        : 'Setor específico',
    };

    return destinos[aviso.destino];
  }

  private nomeTipoAcesso(
    tipo: TipoAcessoAviso | null
  ): string {
    if (!tipo) {
      return 'Perfil específico';
    }

    const nomes: Record<
      TipoAcessoAviso,
      string
    > = {
      FUNCIONARIO: 'Funcionários',
      RH: 'Recursos Humanos',
      GESTOR: 'Gestores',
    };

    return nomes[tipo];
  }

  private formatarDataHora(
    valor: string
  ): {
    data: string;
    horario: string;
  } {
    const dataISO = valor.substring(0, 10);
    const horario =
      valor.substring(11, 16) || '--:--';

    const partes = dataISO.split('-');
    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    const data = new Date(
      ano,
      mes - 1,
      dia
    ).toLocaleDateString('pt-BR');

    return {
      data,
      horario,
    };
  }

  private formatarExpiracao(
    valor: string
  ): string {
    const dataHora =
      this.formatarDataHora(valor);

    return `${dataHora.data} às ${dataHora.horario}`;
  }

  private get chaveIdsLidos(): string {
    const usuario =
      this.usuarioLogadoService
        .obterUsuarioLogado();

    const identificador =
      usuario?.id ?? 'anonimo';

    return `avisosLidos:${identificador}`;
  }

  private carregarIdsLidos(): Set<number> {
    const valor =
      localStorage.getItem(
        this.chaveIdsLidos
      );

    if (!valor) {
      return new Set<number>();
    }

    try {
      const ids = JSON.parse(valor) as unknown;

      if (!Array.isArray(ids)) {
        return new Set<number>();
      }

      return new Set<number>(
        ids.filter(
          (id: unknown): id is number =>
            typeof id === 'number'
        )
      );
    } catch {
      localStorage.removeItem(
        this.chaveIdsLidos
      );

      return new Set<number>();
    }
  }

  private salvarIdsLidos(): void {
    localStorage.setItem(
      this.chaveIdsLidos,
      JSON.stringify(
        Array.from(this.idsLidos)
      )
    );
  }

  private removerIdsInexistentes(): void {
    const idsAtuais = new Set<number>(
      this.avisos.map(
        (
          aviso: AvisoFuncionario
        ): number => aviso.id
      )
    );

    this.idsLidos = new Set<number>(
      Array.from(this.idsLidos).filter(
        (id: number) => idsAtuais.has(id)
      )
    );

    this.salvarIdsLidos();
  }

  private obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string
  ): string {
    if (erro instanceof HttpErrorResponse) {
      if (erro.status === 0) {
        return 'Não foi possível conectar ao servidor.';
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
      return 'O servidor demorou muito para responder.';
    }

    return mensagemPadrao;
  }
}