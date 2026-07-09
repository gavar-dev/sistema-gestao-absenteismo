import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {
  dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  titulo = 'Início';
  subtitulo = 'Área do funcionário';
  descricao = 'Acompanhe suas informações principais.';

  constructor(private router: Router) {
    this.atualizarHeader(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.atualizarHeader(event.urlAfterRedirects);
      });
  }
 
  private atualizarHeader(url: string): void {
    const headers: Record<string, { titulo: string; descricao: string, subtitulo: string }> = {
      '/': {
        titulo: 'Início',
        subtitulo: 'Área do funcionário',
        descricao: 'Veja um resumo das suas informações na intranet.',
      },
      '/meus-pontos': {
        titulo: 'Meu ponto',
        subtitulo: 'Área do funcionário',
        descricao: 'Acompanhe sua jornada, registre os horários do dia e corrija pendências quando necessário.',
      },
      '/solicitacao': {
        titulo: 'Solicitações',
        subtitulo: 'Área do funcionário',
        descricao: 'Abra solicitações para correção de ponto, férias, justificativas e dados cadastrais.',
      },
      '/historico': {
        titulo: 'Histórico',
        subtitulo: 'Área do funcionário',
        descricao: 'Consulte seus registros anteriores de ponto e solicitações.',
      },
      '/meus-dados': {
        titulo: 'Meus dados',
        subtitulo: 'Área do funcionário',
        descricao: 'Visualize suas informações pessoais e profissionais.',
      },
      '/avisos': {
        titulo: 'Avisos',
        subtitulo: 'Área do funcionário',
        descricao: 'Acompanhe comunicados importantes da empresa.',
      },
      '/gestao/inicio': {
        titulo: 'Análise de absenteísmo',
        subtitulo: 'Área de Gestão dos funcionários',
        descricao: 'Dashboard com a análise do absenteismo da empresa.',
      },
      '/gestao/funcionarios': {
        titulo: 'Gestão dos funcionários',
        subtitulo: 'Área de Gestão dos funcionários',
        descricao: 'Dados dos funcionarios.',
      },
      '/gestao/solicitacoes': {
        titulo: 'Solicitações dos funcionários',
        subtitulo: 'Área de Gestão dos funcionários',
        descricao: 'Solicitações feitas pelos funcionarios.',
      },
      '/gestao/cadastro': {
        titulo: 'Cadastro dos funcionários',
        subtitulo: 'Área de Gestão dos funcionários',
        descricao: 'Cadastrar novos funcionarios.',
      },
    };

    const header = headers[url] ?? headers['/'];

    this.titulo = header.titulo;
    this.subtitulo = header.subtitulo;
    this.descricao = header.descricao;
  }
}
