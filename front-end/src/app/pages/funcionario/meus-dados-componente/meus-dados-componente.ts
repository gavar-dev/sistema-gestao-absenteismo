import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DadosPessoais {
  nome: string;
  matricula: string;
  setor: string;
  cargo: string;
  status: string;
  horarioPadrao: string;
  telefone: string;
  emailCorporativo: string;
}

@Component({
  selector: 'app-meus-dados-componente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meus-dados-componente.html',
  styleUrl: './meus-dados-componente.css'
})
export class MeusDadosComponente implements OnInit {

  emEdicao = false;

  dados: DadosPessoais = {
    nome: 'Maria Silva',
    matricula: '1024',
    setor: 'Analista de Vendas',
    cargo: 'Desenvolvedor',
    status: 'Ativo',
    horarioPadrao: '08:00 às 17:00',
    telefone: '(21) 9 9999-9999',
    emailCorporativo: 'maria.silva@gmail.com'
  };

  // guarda uma cópia dos dados originais para permitir "Cancelar"
  private dadosOriginais!: DadosPessoais;

  ngOnInit(): void {
    this.dadosOriginais = { ...this.dados };
  }

  solicitarCorrecao(): void {
    this.dadosOriginais = { ...this.dados };
    this.emEdicao = true;
  }

  cancelarEdicao(): void {
    this.dados = { ...this.dadosOriginais };
    this.emEdicao = false;
  }

  salvarCorrecao(): void {
    // Aqui você chama o service para enviar a solicitação de correção ao back-end
    // this.funcionarioService.solicitarCorrecaoDados(this.dados).subscribe(...)

    this.dadosOriginais = { ...this.dados };
    this.emEdicao = false;
  }
}