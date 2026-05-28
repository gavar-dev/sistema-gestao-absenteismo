import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sistema-gestao-absenteismo');

  // constructor(public router: Router) {}

  // esconderSidebar(): boolean {
  //   return this.router.url === '/login';
  // }
}
