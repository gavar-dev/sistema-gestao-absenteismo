import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface AcaoPonto {
  nome: string;
  descricao: string;
  icone: string;
}

interface RegistroPonto {
  tipo: string;
  horario: string;
  status: string;
  icone: string;
}

@Component({
  selector: 'app-meu-ponto-componente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meu-ponto-componente.html',
  styleUrl: './meu-ponto-componente.css',
})
export class MeuPontoComponente {
  dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  resumo = [
    { titulo: 'Entrada prevista', valor: '08:00', detalhe: 'Tolerância: 30 min', icone: 'bi-alarm' },
    { titulo: 'Horas trabalhadas', valor: '04h12', detalhe: 'Atualizado automaticamente', icone: 'bi-hourglass-split' },
    { titulo: 'Status do dia', valor: 'Em andamento', detalhe: 'Sem pendência crítica', icone: 'bi-activity' },
    { titulo: 'Saldo estimado', valor: '+00h08', detalhe: 'Prévia do banco de horas', icone: 'bi-graph-up-arrow' }
  ];

  acoesPonto: AcaoPonto[] = [
    { nome: 'Entrada', descricao: 'Registrar início da jornada', icone: 'bi-box-arrow-in-right' },
    { nome: 'Almoço', descricao: 'Registrar saída para intervalo', icone: 'bi-cup-hot' },
    { nome: 'Retorno', descricao: 'Registrar volta do intervalo', icone: 'bi-arrow-return-left' },
    { nome: 'Saída', descricao: 'Registrar encerramento da jornada', icone: 'bi-box-arrow-right' }
  ];

  registros: RegistroPonto[] = [
    { tipo: 'Entrada', horario: '08:03', status: 'Registrado', icone: 'bi-box-arrow-in-right' },
    { tipo: 'Almoço', horario: '12:05', status: 'Registrado', icone: 'bi-cup-hot' }
  ];

  proximosEventos = [
    { titulo: 'Retorno do almoço', horario: '13:05', texto: 'O sistema pode lembrar o funcionário caso não registre o retorno.' },
    { titulo: 'Saída prevista', horario: '17:00', texto: 'O horário pode variar conforme saldo e jornada do dia.' }
  ];

  registrado(nome: string): boolean {
    return this.registros.some((registro) => registro.tipo === nome);
  }

  registrarPonto(acao: AcaoPonto): void {
    if (this.registrado(acao.nome)) {
      return;
    }

    const horario = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.registros = [
      ...this.registros,
      {
        tipo: acao.nome,
        horario,
        status: 'Registrado agora',
        icone: acao.icone
      }
    ];
  }
}
