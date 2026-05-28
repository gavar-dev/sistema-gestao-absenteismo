import { Component } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';

@Component({
  selector: 'app-meus-dados-componente',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './meus-dados-componente.html',
  styleUrl: './meus-dados-componente.css',
})
export class MeusDadosComponente {}
