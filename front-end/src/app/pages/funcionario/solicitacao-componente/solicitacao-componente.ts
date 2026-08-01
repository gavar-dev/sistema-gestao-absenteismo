import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TipoSolicitacao {
  titulo: TipoSolicitacaoNome;
  descricao: string;
  icone: string;
  tipo: 'neutro' | 'atencao' | 'positivo' | 'perigo';
}

type TipoSolicitacaoNome =
  | 'Correção de ponto'
  | 'Justificativa de falta'
  | 'Solicitação de férias'
  | 'Correção de cadastro';

type StatusSolicitacao = 'Pendente' | 'Aprovada' | 'Concluída' | 'Negada';

interface SolicitacaoRecente {
  codigo: string;
  tipo: string;
  data: string;
  status: StatusSolicitacao;
}

interface FormularioSolicitacao {
  tipo: TipoSolicitacaoNome;
  dataRelacionada: string;
  horarioSugerido: string;
  prioridade: 'Normal' | 'Alta';
  descricao: string;
  anexo: string;
}

@Component({
  selector: 'app-solicitacao-componente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacao-componente.html',
  styleUrl: './solicitacao-componente.css',
})
export class SolicitacaoComponente {
  mensagemSucesso = '';

  tipos: TipoSolicitacao[] = [
    {
      titulo: 'Correção de ponto',
      descricao: 'Entrada, almoço, retorno ou saída não registrada.',
      icone: 'bi-clock-history',
      tipo: 'neutro',
    },
    {
      titulo: 'Justificativa de falta',
      descricao: 'Envie o motivo da ausência e os comprovantes disponíveis.',
      icone: 'bi-calendar-x',
      tipo: 'perigo',
    },
    {
      titulo: 'Solicitação de férias',
      descricao: 'Informe o período desejado para avaliação do setor.',
      icone: 'bi-suitcase-lg',
      tipo: 'positivo',
    },
    {
      titulo: 'Correção de cadastro',
      descricao: 'Solicite atualização de telefone, endereço ou dados pessoais.',
      icone: 'bi-person-lines-fill',
      tipo: 'atencao',
    },
  ];

  regras = [
    'Correções de ponto podem ser solicitadas em até <strong>48 horas</strong>.',
    'Inclua horários e detalhes suficientes para facilitar a conferência do RH.',
    'O RH poderá ajustar os dados informados antes de concluir a análise.',
    'Pedidos de férias dependem da disponibilidade do setor e da aprovação da gestão.',
  ];

  historico: SolicitacaoRecente[] = [
    { codigo: '#SOL-1024', tipo: 'Correção de ponto', data: '27/07/2026', status: 'Pendente' },
    { codigo: '#SOL-1018', tipo: 'Solicitação de férias', data: '21/07/2026', status: 'Aprovada' },
    { codigo: '#SOL-1009', tipo: 'Correção de cadastro', data: '14/07/2026', status: 'Concluída' },
    { codigo: '#SOL-1004', tipo: 'Justificativa de falta', data: '08/07/2026', status: 'Negada' },
  ];

  formulario: FormularioSolicitacao = this.criarFormularioInicial();

  get totalPendentes(): number {
    return this.historico.filter((item) => item.status === 'Pendente').length;
  }

  get totalResolvidas(): number {
    return this.historico.filter((item) => item.status !== 'Pendente').length;
  }

  selecionarTipo(tipo: TipoSolicitacaoNome): void {
    this.formulario.tipo = tipo;
    this.mensagemSucesso = '';

    setTimeout(() => {
      document.getElementById('formulario-solicitacao')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  criarSolicitacao(): void {
    const proximoNumero = 1025 + this.historico.length;
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    this.historico = [
      {
        codigo: `#SOL-${proximoNumero}`,
        tipo: this.formulario.tipo,
        data: dataAtual,
        status: 'Pendente',
      },
      ...this.historico,
    ];

    this.mensagemSucesso = `A solicitação de ${this.formulario.tipo.toLowerCase()} foi enviada para o RH.`;
    this.formulario = this.criarFormularioInicial();
  }

  limparFormulario(): void {
    this.formulario = this.criarFormularioInicial();
    this.mensagemSucesso = '';
  }

  classeStatus(status: StatusSolicitacao): string {
    const classes: Record<StatusSolicitacao, string> = {
      Pendente: 'text-bg-warning',
      Aprovada: 'text-bg-success',
      Concluída: 'text-bg-primary',
      Negada: 'text-bg-danger',
    };

    return classes[status];
  }

  private criarFormularioInicial(): FormularioSolicitacao {
    return {
      tipo: 'Correção de ponto',
      dataRelacionada: '',
      horarioSugerido: '',
      prioridade: 'Normal',
      descricao: '',
      anexo: '',
    };
  }
}
