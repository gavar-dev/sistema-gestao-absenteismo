import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TipoAviso = 'info' | 'warning' | 'success' | 'danger';
type CategoriaAviso = 'Ponto' | 'Solicitação' | 'Cadastro' | 'Comunicado';

interface AvisoFuncionario {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  tipo: TipoAviso;
  categoria: CategoriaAviso;
  icone: string;
  lido: boolean;
  rota?: string;
  acao?: string;
}

interface ResumoAviso {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo: 'neutro' | 'atencao' | 'positivo' | 'perigo';
}

@Component({
  selector: 'app-aviso-componente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './aviso-componente.html',
  styleUrl: './aviso-componente.css',
})
export class AvisoComponente {
  filtroCategoria = 'Todos';
  filtroLeitura = 'Todos';
  filtroBusca = '';

  categorias = ['Todos', 'Ponto', 'Solicitação', 'Cadastro', 'Comunicado'];
  estadosLeitura = ['Todos', 'Não lidos', 'Lidos'];

  avisos: AvisoFuncionario[] = [
    {
      id: 1,
      titulo: 'Prazo para justificar falta termina amanhã',
      descricao: 'A falta do dia 29/07 ainda precisa de justificativa. Envie a solicitação dentro do prazo de 48 horas.',
      data: '31/07/2026',
      horario: '08:10',
      tipo: 'danger',
      categoria: 'Ponto',
      icone: 'bi-calendar-x',
      lido: false,
      rota: '/solicitacao',
      acao: 'Justificar agora',
    },
    {
      id: 2,
      titulo: 'Retorno do almoço ainda não registrado',
      descricao: 'O sistema não encontrou o registro de retorno do almoço de hoje. Confira sua jornada antes da saída.',
      data: '31/07/2026',
      horario: '13:18',
      tipo: 'warning',
      categoria: 'Ponto',
      icone: 'bi-exclamation-triangle',
      lido: false,
      rota: '/meus-pontos',
      acao: 'Ver meu ponto',
    },
    {
      id: 3,
      titulo: 'Correção cadastral concluída',
      descricao: 'A solicitação de atualização do telefone foi aprovada e seus dados já foram atualizados pelo RH.',
      data: '30/07/2026',
      horario: '16:42',
      tipo: 'success',
      categoria: 'Cadastro',
      icone: 'bi-person-check',
      lido: true,
      rota: '/meus-dados',
      acao: 'Conferir dados',
    },
    {
      id: 4,
      titulo: 'Solicitação de correção em análise',
      descricao: 'O RH iniciou a análise do protocolo #SOL-1024. Você receberá um novo aviso quando houver uma decisão.',
      data: '30/07/2026',
      horario: '10:05',
      tipo: 'info',
      categoria: 'Solicitação',
      icone: 'bi-hourglass-split',
      lido: false,
      rota: '/solicitacao',
      acao: 'Acompanhar pedido',
    },
    {
      id: 5,
      titulo: 'Comunicado sobre fechamento mensal',
      descricao: 'Os registros de julho serão consolidados no dia 03/08. Verifique possíveis pendências antes dessa data.',
      data: '29/07/2026',
      horario: '09:00',
      tipo: 'info',
      categoria: 'Comunicado',
      icone: 'bi-megaphone',
      lido: true,
      rota: '/historico',
      acao: 'Ver histórico',
    },
  ];

  get naoLidos(): number {
    return this.avisos.filter((aviso) => !aviso.lido).length;
  }

  get urgentes(): number {
    return this.avisos.filter((aviso) => aviso.tipo === 'danger' && !aviso.lido).length;
  }

  get concluidos(): number {
    return this.avisos.filter((aviso) => aviso.tipo === 'success').length;
  }

  get resumo(): ResumoAviso[] {
    return [
      {
        titulo: 'Total de avisos',
        valor: this.avisos.length.toString(),
        detalhe: 'Comunicados disponíveis',
        icone: 'bi-bell',
        tipo: 'neutro',
      },
      {
        titulo: 'Não lidos',
        valor: this.naoLidos.toString(),
        detalhe: 'Precisam da sua atenção',
        icone: 'bi-envelope-exclamation',
        tipo: 'atencao',
      },
      {
        titulo: 'Urgentes',
        valor: this.urgentes.toString(),
        detalhe: 'Com prazo ou pendência',
        icone: 'bi-exclamation-octagon',
        tipo: 'perigo',
      },
      {
        titulo: 'Concluídos',
        valor: this.concluidos.toString(),
        detalhe: 'Atualizações confirmadas',
        icone: 'bi-check2-circle',
        tipo: 'positivo',
      },
    ];
  }

  get avisosFiltrados(): AvisoFuncionario[] {
    const busca = this.filtroBusca.trim().toLowerCase();

    return this.avisos.filter((aviso) => {
      const categoriaConfere = this.filtroCategoria === 'Todos' || aviso.categoria === this.filtroCategoria;
      const leituraConfere =
        this.filtroLeitura === 'Todos' ||
        (this.filtroLeitura === 'Não lidos' && !aviso.lido) ||
        (this.filtroLeitura === 'Lidos' && aviso.lido);
      const buscaConfere =
        !busca ||
        aviso.titulo.toLowerCase().includes(busca) ||
        aviso.descricao.toLowerCase().includes(busca) ||
        aviso.categoria.toLowerCase().includes(busca);

      return categoriaConfere && leituraConfere && buscaConfere;
    });
  }

  marcarComoLido(aviso: AvisoFuncionario): void {
    aviso.lido = true;
  }

  marcarTodosComoLidos(): void {
    this.avisos = this.avisos.map((aviso) => ({ ...aviso, lido: true }));
  }

  limparFiltros(): void {
    this.filtroCategoria = 'Todos';
    this.filtroLeitura = 'Todos';
    this.filtroBusca = '';
  }

  classeTipo(tipo: TipoAviso): string {
    return `aviso-item-${tipo}`;
  }

  rotuloTipo(tipo: TipoAviso): string {
    const rotulos: Record<TipoAviso, string> = {
      info: 'Informação',
      warning: 'Atenção',
      success: 'Concluído',
      danger: 'Urgente',
    };

    return rotulos[tipo];
  }
}
