import { Component, DOCUMENT, Inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './shared/footer-component/footer-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar, CommonModule, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sistema-gestao-absenteismo');

  constructor(
    public router: Router,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    const temaSalvo = localStorage.getItem('tema');
    this.document.documentElement.setAttribute('data-bs-theme', temaSalvo === 'dark' ? 'dark' : 'light');
  }

  mostrarSidebar(): boolean {
    return !this.router.url.startsWith('/login');
  }
}
