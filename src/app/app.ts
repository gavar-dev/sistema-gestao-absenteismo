import { Component, DOCUMENT, Inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/sidebar/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sistema-gestao-absenteismo');

  // constructor(public router: Router) {}

  // esconderSidebar(): boolean {
  //   return this.router.url === '/login';
  // }

  constructor(
    public router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('tema');
    this.document.documentElement.setAttribute('data-bs-theme', temaSalvo === 'dark' ? 'dark' : 'light');
  }

  mostrarSidebar(): boolean {
    return !this.router.url.startsWith('/login');
  }
}
