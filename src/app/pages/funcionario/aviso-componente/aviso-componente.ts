import { Component } from '@angular/core';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/header-component/header-component';

@Component({
  selector: 'app-aviso-componente',
  standalone: true,
  imports: [Sidebar, HeaderComponent],
  templateUrl: './aviso-componente.html',
  styleUrl: './aviso-componente.css',
})
export class AvisoComponente {}
