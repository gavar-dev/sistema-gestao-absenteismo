import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { FuncionarioService } from '../../core/services/funcionario';

@Component({
  selector: 'app-funcionario-avatar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl:
    './funcionario-avatar.html',
  styleUrl:
    './funcionario-avatar.css',
})
export class FuncionarioAvatarComponent
  implements OnChanges, OnDestroy {

  @Input()
  funcionarioId:
    number | null | undefined = null;

  @Input()
  nomeCompleto = '';

  @Input()
  tamanho = 48;

  fotoUrl: string | null = null;
  carregandoFoto = false;

  private inscricaoFoto:
    Subscription | null = null;

  constructor(
    private readonly funcionarioService:
      FuncionarioService
  ) {}

  get iniciais(): string {
    const partes =
      this.nomeCompleto
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) {
      return '?';
    }

    return partes
      .slice(0, 2)
      .map(
        (parte: string): string =>
          parte.charAt(0).toUpperCase()
      )
      .join('');
  }

  ngOnChanges(
    alteracoes: SimpleChanges
  ): void {
    if (
      alteracoes['funcionarioId'] ||
      alteracoes['nomeCompleto']
    ) {
      this.carregarFoto();
    }
  }

  ngOnDestroy(): void {
    this.cancelarCarregamento();
    this.revogarFotoAtual();
  }

  private carregarFoto(): void {
    this.cancelarCarregamento();
    this.revogarFotoAtual();

    const id = this.funcionarioId;

    if (
      id === null ||
      id === undefined ||
      id <= 0
    ) {
      return;
    }

    this.carregandoFoto = true;

    this.inscricaoFoto =
      this.funcionarioService
        .buscarFoto(id)
        .subscribe({
          next: (
            arquivo: Blob | null
          ) => {
            if (
              arquivo &&
              arquivo.size > 0
            ) {
              this.fotoUrl =
                URL.createObjectURL(
                  arquivo
                );
            }

            this.carregandoFoto = false;
          },

          error: (erro: unknown) => {
            console.error(
              'Erro ao carregar foto do funcionário:',
              erro
            );

            this.fotoUrl = null;
            this.carregandoFoto = false;
          },
        });
  }

  private cancelarCarregamento(): void {
    this.inscricaoFoto?.unsubscribe();
    this.inscricaoFoto = null;
  }

  private revogarFotoAtual(): void {
    if (this.fotoUrl) {
      URL.revokeObjectURL(
        this.fotoUrl
      );

      this.fotoUrl = null;
    }
  }
}
