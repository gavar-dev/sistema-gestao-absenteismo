import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLink,  RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  usuario = {
    nome: 'Maria Silva',
    cargo: 'Analista de Vendas',
    iniciais: 'MS'
  };

  menu = [
  { nome: 'INÍCIO', rota: '/' },
  { nome: 'Meu ponto', rota: '/meus-pontos' },
  { nome: 'Solicitação', rota: '/solicitacao' },
  { nome: 'Histórico', rota: '/historico' },
  { nome: 'Meus dados', rota: '/meus-dados' },
  { nome: 'Avisos', rota: '/avisos' }
];
}