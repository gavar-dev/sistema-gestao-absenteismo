import { Component } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';

@Component({
  selector: 'app-meu-ponto-componente',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './meu-ponto-componente.html',
  styleUrl: './meu-ponto-componente.css',
})
export class MeuPontoComponente {}
