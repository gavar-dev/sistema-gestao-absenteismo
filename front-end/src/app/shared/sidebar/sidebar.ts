import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type Tema = 'light' | 'dark';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  temaAtual: Tema = 'light';

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

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('tema') as Tema | null;
    this.aplicarTema(temaSalvo === 'dark' ? 'dark' : 'light');
  }

  alternarTema(): void {
    const proximoTema: Tema = this.temaAtual === 'dark' ? 'light' : 'dark';
    this.aplicarTema(proximoTema);
  }

  private aplicarTema(tema: Tema): void {
    this.temaAtual = tema;
    this.document.documentElement.setAttribute('data-bs-theme', tema);
    localStorage.setItem('tema', tema);
  }
}
