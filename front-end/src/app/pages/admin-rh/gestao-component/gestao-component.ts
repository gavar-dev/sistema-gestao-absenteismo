import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gestao-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gestao-component.html',
  styleUrl: './gestao-component.css',
})
export class GestaoComponent {
  funcionarios = [
    { nome: 'Maria Silva', setor: 'Comercial', cargo: 'Analista de Vendas', status: 'Ativo', atrasos: 2, faltas: 0 },
    { nome: 'João Pereira', setor: 'Operações', cargo: 'Auxiliar Operacional', status: 'Ativo', atrasos: 5, faltas: 1 },
    { nome: 'Camila Rocha', setor: 'Administrativo', cargo: 'Assistente Administrativo', status: 'Férias', atrasos: 0, faltas: 0 },
    { nome: 'Pedro Santos', setor: 'Tecnologia', cargo: 'Desenvolvedor Jr.', status: 'Ativo', atrasos: 1, faltas: 0 },
    { nome: 'Bruna Lima', setor: 'Operações', cargo: 'Supervisora', status: 'Inativo', atrasos: 0, faltas: 2 }
  ];

  statusClasse(status: string): string {
    const classes: Record<string, string> = {
      Ativo: 'text-bg-success',
      Férias: 'text-bg-warning',
      Inativo: 'text-bg-secondary'
    };

    return classes[status] ?? 'text-bg-primary';
  }
}
