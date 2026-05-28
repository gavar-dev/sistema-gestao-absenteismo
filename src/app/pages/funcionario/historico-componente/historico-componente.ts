import { Component } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';

@Component({
  selector: 'app-historico-componente',
  standalone:true,
  imports: [Sidebar],
  templateUrl: './historico-componente.html',
  styleUrl: './historico-componente.css',
})
export class HistoricoComponente {}
