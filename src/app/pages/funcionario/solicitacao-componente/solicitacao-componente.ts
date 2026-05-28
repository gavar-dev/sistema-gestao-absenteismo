import { Component } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';

@Component({
  selector: 'app-solicitacao-componente',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './solicitacao-componente.html',
  styleUrl: './solicitacao-componente.css',
})
export class SolicitacaoComponente {}
