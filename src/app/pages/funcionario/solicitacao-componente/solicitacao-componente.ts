import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface TipoSolicitacao {
  titulo: string;
  descricao: string;
  icone: string;
}

interface SolicitacaoRecente {
  codigo: string;
  tipo: string;
  data: string;
  status: string;
  classe: string;
}

@Component({
  selector: 'app-solicitacao-componente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacao-componente.html',
  styleUrl: './solicitacao-componente.css',
})
export class SolicitacaoComponente {
  tipos: TipoSolicitacao[] = [
    {
      titulo: 'Correção de ponto',
      descricao: 'Entrada, almoço, retorno ou saída esquecida.',
      icone: 'bi-clock-history'
    },
    {
      titulo: 'Justificativa de falta',
      descricao: 'Envie o motivo da ausência para avaliação do RH.',
      icone: 'bi-calendar-x'
    },
    {
      titulo: 'Solicitação de férias',
      descricao: 'Informe o período desejado para aprovação.',
      icone: 'bi-suitcase-lg'
    },
    {
      titulo: 'Correção de cadastro',
      descricao: 'Atualize telefone, endereço ou dados pessoais.',
      icone: 'bi-person-lines-fill'
    }
  ];

  regras = [
    'Correção de ponto pode ser solicitada em até <strong>48 horas</strong>.',
    'Atraso começa a ser acompanhado após a tolerância definida pelo RH.',
    'O RH pode ajustar o horário antes de aprovar a solicitação.',
    'Solicitação de férias depende de aprovação e disponibilidade do setor.'
  ];

  historico: SolicitacaoRecente[] = [
    { codigo: '#SOL-1024', tipo: 'Correção de ponto', data: '27/05/2026', status: 'Pendente', classe: 'text-bg-warning' },
    { codigo: '#SOL-1018', tipo: 'Solicitação de férias', data: '21/05/2026', status: 'Aprovada', classe: 'text-bg-success' },
    { codigo: '#SOL-1009', tipo: 'Correção de cadastro', data: '14/05/2026', status: 'Concluída', classe: 'text-bg-primary' },
    { codigo: '#SOL-1009', tipo: 'justificativa de Falta', data: '16/05/2026', status: 'Negada', classe: 'text-bg-danger' }
  ];

  criarSolicitacao(): void {
    const proximoCodigo = `#SOL-${1025 + this.historico.length}`;
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    this.historico = [
      {
        codigo: proximoCodigo,
        tipo: 'Nova solicitação',
        data: dataAtual,
        status: 'Pendente',
        classe: 'text-bg-warning'
      },
      ...this.historico
    ];
  }
}
