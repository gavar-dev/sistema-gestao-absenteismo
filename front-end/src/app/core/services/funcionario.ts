import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  Observable,
  of,
  shareReplay,
  throwError,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  FuncionarioCreateRequest,
  FuncionarioResponse,
  FuncionarioStatusRequest,
  FuncionarioUpdateRequest,
  StatusFuncionario,
} from '../../models/funcionario';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {

  private readonly url =
    `${environment.apiUrl}/funcionarios`;

  private readonly cacheFotos =
    new Map<number, Observable<Blob | null>>();

  constructor(
    private readonly http: HttpClient
  ) {}

  buscarMeuPerfil():
    Observable<FuncionarioResponse> {

    return this.http.get<FuncionarioResponse>(
      `${this.url}/me`
    );
  }

  listar(
    status?: StatusFuncionario
  ): Observable<FuncionarioResponse[]> {

    if (status) {
      return this.http.get<FuncionarioResponse[]>(
        this.url,
        {
          params: {
            status,
          },
        }
      );
    }

    return this.http.get<FuncionarioResponse[]>(
      this.url
    );
  }

  buscarPorId(
    id: number
  ): Observable<FuncionarioResponse> {

    return this.http.get<FuncionarioResponse>(
      `${this.url}/${id}`
    );
  }

  buscarFoto(
    id: number
  ): Observable<Blob | null> {

    const fotoEmCache =
      this.cacheFotos.get(id);

    if (fotoEmCache) {
      return fotoEmCache;
    }

    const requisicao =
      this.http.get(
        `${this.url}/${id}/foto`,
        {
          responseType: 'blob',
        }
      )
        .pipe(
          catchError(
            (erro: {
              status?: number;
            }) => {
              if (erro.status === 404) {
                return of(null);
              }

              return throwError(
                () => erro
              );
            }
          ),
          shareReplay({
            bufferSize: 1,
            refCount: false,
          })
        );

    this.cacheFotos.set(
      id,
      requisicao
    );

    return requisicao;
  }

  limparCacheFoto(
    id: number
  ): void {
    this.cacheFotos.delete(id);
  }

  criar(
    request: FuncionarioCreateRequest,
    foto: File | null = null
  ): Observable<FuncionarioResponse> {

    const formulario =
      new FormData();

    const dados =
      new Blob(
        [
          JSON.stringify(request),
        ],
        {
          type: 'application/json',
        }
      );

    formulario.append(
      'dados',
      dados
    );

    if (foto) {
      formulario.append(
        'foto',
        foto,
        foto.name
      );
    }

    return this.http.post<FuncionarioResponse>(
      this.url,
      formulario
    );
  }

  atualizar(
    id: number,
    request: FuncionarioUpdateRequest
  ): Observable<FuncionarioResponse> {

    return this.http.put<FuncionarioResponse>(
      `${this.url}/${id}`,
      request
    );
  }

  alterarStatus(
    id: number,
    status: StatusFuncionario
  ): Observable<FuncionarioResponse> {

    const request:
      FuncionarioStatusRequest = {
      status,
    };

    return this.http.patch<FuncionarioResponse>(
      `${this.url}/${id}/status`,
      request
    );
  }

  desativar(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.url}/${id}`
    );
  }
}