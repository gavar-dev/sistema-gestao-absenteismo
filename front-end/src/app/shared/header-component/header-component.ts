import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

type AreaHeader = 'funcionario' | 'gestao';

interface HeaderConfig {
  titulo: string;
  subtitulo: string;
  descricao: string;
  icone: string;
  area: AreaHeader;
}

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {
  private readonly hoje = new Date();

  dataHoje = this.hoje.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  diaSemana = this.hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
  });

  titulo = 'Início';
  subtitulo = 'Portal do funcionário';
  descricao = 'Veja um resumo das suas informações na intranet.';
  icone = 'bi-house-heart';
  areaAtual: AreaHeader = 'funcionario';

  constructor(private router: Router) {
    this.atualizarHeader(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.atualizarHeader(event.urlAfterRedirects);
      });
  }

  private atualizarHeader(url: string): void {
    const caminho = this.normalizarUrl(url);

    const headers: Record<string, HeaderConfig> = {
      '/': {
        titulo: 'Início',
        subtitulo: 'Portal do funcionário',
        descricao: 'Veja um resumo da sua jornada, pendências e principais atalhos da intranet.',
        icone: 'bi-house-heart',
        area: 'funcionario',
      },
      '/meus-pontos': {
        titulo: 'Meu ponto',
        subtitulo: 'Portal do funcionário',
        descricao: 'Registre os horários do dia e acompanhe o andamento da sua jornada.',
        icone: 'bi-fingerprint',
        area: 'funcionario',
      },
      '/solicitacao': {
        titulo: 'Solicitações',
        subtitulo: 'Portal do funcionário',
        descricao: 'Envie pedidos de correção, justificativas, férias e atualização cadastral.',
        icone: 'bi-file-earmark-text',
        area: 'funcionario',
      },
      '/historico': {
        titulo: 'Histórico',
        subtitulo: 'Portal do funcionário',
        descricao: 'Consulte seus registros anteriores de ponto e acompanhe as ocorrências da jornada.',
        icone: 'bi-clock-history',
        area: 'funcionario',
      },
      '/meus-dados': {
        titulo: 'Meus dados',
        subtitulo: 'Portal do funcionário',
        descricao: 'Visualize suas informações pessoais e profissionais cadastradas no sistema.',
        icone: 'bi-person-vcard',
        area: 'funcionario',
      },
      '/avisos': {
        titulo: 'Avisos',
        subtitulo: 'Portal do funcionário',
        descricao: 'Acompanhe comunicados, orientações e informações importantes da empresa.',
        icone: 'bi-megaphone',
        area: 'funcionario',
      },
      '/gestao/inicio': {
        titulo: 'Análise de absenteísmo',
        subtitulo: 'Painel de Gestão e RH',
        descricao: 'Acompanhe os principais indicadores de jornada e absenteísmo da empresa.',
        icone: 'bi-graph-up-arrow',
        area: 'gestao',
      },
      '/gestao/meu-ponto': {
        titulo: 'Meu ponto',
        subtitulo: 'Painel de Gestão e RH',
        descricao: 'Registre sua própria jornada de trabalho e acompanhe os horários do dia.',
        icone: 'bi-fingerprint',
        area: 'gestao',
      },
      '/gestao/meus-dados': {
        titulo: 'Meus dados',
        subtitulo: 'Painel de Gestão e RH',
        descricao: 'Consulte suas próprias informações pessoais e profissionais cadastradas no sistema.',
        icone: 'bi-person-vcard',
        area: 'gestao',
      },
      '/gestao/funcionarios': {
        titulo: 'Gestão de funcionários',
        subtitulo: 'Painel de Gestão e RH',
        descricao: 'Consulte, filtre e acompanhe os dados dos funcionários da empresa.',
        icone: 'bi-people',
        area: 'gestao',
      },
      '/gestao/solicitacoes': {
        titulo: 'Solicitações dos funcionários',
        subtitulo: 'Painel de Gestão e RH',
        descricao: 'Analise as solicitações recebidas e acompanhe o status de cada demanda.',
        icone: 'bi-inbox',
        area: 'gestao',
      },
      '/gestao/cadastro': {
        titulo: 'Cadastro de funcionários',
        subtitulo: 'Painel de Gestão e RH',
        descricao: 'Cadastre novos funcionários e registre suas informações profissionais.',
        icone: 'bi-person-plus',
        area: 'gestao',
      },
    };

    const fallback = caminho.startsWith('/gestao')
      ? headers['/gestao/inicio']
      : headers['/'];

    const header = headers[caminho] ?? fallback;

    this.titulo = header.titulo;
    this.subtitulo = header.subtitulo;
    this.descricao = header.descricao;
    this.icone = header.icone;
    this.areaAtual = header.area;
  }

  private normalizarUrl(url: string): string {
    const caminhoSemParametros = url.split('?')[0].split('#')[0];
    const caminhoSemBarraFinal = caminhoSemParametros.replace(/\/+$/, '');

    return caminhoSemBarraFinal || '/';
  }
}
