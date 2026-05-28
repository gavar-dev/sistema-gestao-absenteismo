import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLink, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  usuario = {
    nome: 'Maria Silva',
    cargo: 'Analista de Vendas',
    setor: 'Comercial',
    iniciais: 'MS'
  };

  menu = [
    { nome: 'Início', rota: '/', icone: 'bi-grid-1x2-fill', exata: true },
    { nome: 'Meu ponto', rota: '/meus-pontos', icone: 'bi-clock-history', exata: false },
    { nome: 'Solicitação', rota: '/solicitacao', icone: 'bi-file-earmark-text', exata: false },
    { nome: 'Histórico', rota: '/historico', icone: 'bi-calendar-check', exata: false },
    { nome: 'Meus dados', rota: '/meus-dados', icone: 'bi-person-vcard', exata: false },
    { nome: 'Avisos', rota: '/avisos', icone: 'bi-megaphone', exata: false }
  ];
}