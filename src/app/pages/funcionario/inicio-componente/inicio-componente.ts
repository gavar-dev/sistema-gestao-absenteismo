import { Component } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';

@Component({
  selector: 'app-inicio-componente',
  standalone: true,
  imports: [Sidebar],
  templateUrl: './inicio-componente.html',
  styleUrl: './inicio-componente.css',
})
export class InicioComponente {}
