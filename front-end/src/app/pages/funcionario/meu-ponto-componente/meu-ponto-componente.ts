import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface AcaoPonto {
  nome: string;
  descricao: string;
  icone: string;
}

interface RegistroPonto {
  tipo: string;
  horario: string;
  status: 'Registrado' | 'Registrado agora';
  icone: string;
  observacao: string;
}

interface ResumoPonto {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string;
  tipo: 'positivo' | 'atencao' | 'neutro' | 'perigo';
}

@Component({
  selector: 'app-meu-ponto-componente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meu-ponto-componente.html',
  styleUrl: './meu-ponto-componente.css',
})
export class MeuPontoComponente {
  readonly modoGestao: boolean;

  constructor(private route: ActivatedRoute) {
    this.modoGestao = this.route.snapshot.data['area'] === 'gestao';
  }

  dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  acoesPonto: AcaoPonto[] = [
    { nome: 'Entrada', descricao: 'Registrar início da jornada', icone: 'bi-box-arrow-in-right' },
    { nome: 'Almoço', descricao: 'Registrar saída para intervalo', icone: 'bi-cup-hot' },
    { nome: 'Retorno', descricao: 'Registrar volta do intervalo', icone: 'bi-arrow-return-left' },
    { nome: 'Saída', descricao: 'Registrar encerramento da jornada', icone: 'bi-box-arrow-right' },
  ];

  registros: RegistroPonto[] = [
    {
      tipo: 'Entrada',
      horario: '08:03',
      status: 'Registrado',
      icone: 'bi-box-arrow-in-right',
      observacao: 'Entrada dentro da tolerância.',
    },
    {
      tipo: 'Almoço',
      horario: '12:05',
      status: 'Registrado',
      icone: 'bi-cup-hot',
      observacao: 'Intervalo iniciado normalmente.',
    },
  ];

  get resumo(): ResumoPonto[] {
    return [
      {
        titulo: 'Entrada prevista',
        valor: '08:00',
        detalhe: 'Tolerância: 30 min',
        icone: 'bi-alarm',
        tipo: 'neutro',
      },
      {
        titulo: 'Horas trabalhadas',
        valor: '04h12',
        detalhe: 'Atualizado automaticamente',
        icone: 'bi-hourglass-split',
        tipo: 'positivo',
      },
      {
        titulo: 'Status do dia',
        valor: this.statusDoDia,
        detalhe: this.proximaAcao ? `Próxima ação: ${this.proximaAcao.nome}` : 'Todos os registros concluídos',
        icone: 'bi-activity',
        tipo: this.proximaAcao ? 'atencao' : 'positivo',
      },
      {
        titulo: 'Saldo estimado',
        valor: '+00h08',
        detalhe: 'Prévia do banco de horas',
        icone: 'bi-graph-up-arrow',
        tipo: 'positivo',
      },
    ];
  }

  get percentualJornada(): number {
    return Math.round((this.registros.length / this.acoesPonto.length) * 100);
  }

  get proximaAcao(): AcaoPonto | undefined {
    return this.acoesPonto.find((acao) => !this.registrado(acao.nome));
  }

  get statusDoDia(): string {
    if (this.registros.length === 0) {
      return 'Aguardando entrada';
    }

    if (!this.proximaAcao) {
      return 'Jornada finalizada';
    }

    return 'Em andamento';
  }

  registrado(nome: string): boolean {
    return this.registros.some((registro) => registro.tipo === nome);
  }

  horarioRegistrado(nome: string): string {
    const registro = this.registros.find((item) => item.tipo === nome);
    return registro ? `Registrado às ${registro.horario}` : '';
  }

  registrarProximaAcao(): void {
    if (this.proximaAcao) {
      this.registrarPonto(this.proximaAcao);
    }
  }

  registrarPonto(acao: AcaoPonto): void {
    if (this.registrado(acao.nome)) {
      return;
    }

    const horario = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.registros = [
      ...this.registros,
      {
        tipo: acao.nome,
        horario,
        status: 'Registrado agora',
        icone: acao.icone,
        observacao: 'Registro feito pelo usuário logado.',
      },
    ];
  }

  classeStatus(status: RegistroPonto['status']): string {
    const classes: Record<RegistroPonto['status'], string> = {
      Registrado: 'text-bg-success',
      'Registrado agora': 'text-bg-primary',
    };

    return classes[status];
  }
}
