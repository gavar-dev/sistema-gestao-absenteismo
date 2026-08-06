import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AvisoRequest,
  AvisoResponse,
} from '../../models/aviso';

@Injectable({
  providedIn: 'root',
})
export class AvisoService {
  private readonly url =
    `${environment.apiUrl}/avisos`;

  constructor(
    private readonly http: HttpClient
  ) {}

  listarMeus(): Observable<AvisoResponse[]> {
    return this.http.get<AvisoResponse[]>(
      `${this.url}/meus`
    );
  }

  listarGerencial(
    ativo?: boolean
  ): Observable<AvisoResponse[]> {
    if (ativo === undefined) {
      return this.http.get<AvisoResponse[]>(
        this.url
      );
    }

    return this.http.get<AvisoResponse[]>(
      this.url,
      {
        params: {
          ativo,
        },
      }
    );
  }

  buscarPorId(
    id: number
  ): Observable<AvisoResponse> {
    return this.http.get<AvisoResponse>(
      `${this.url}/${id}`
    );
  }

  criar(
    request: AvisoRequest
  ): Observable<AvisoResponse> {
    return this.http.post<AvisoResponse>(
      this.url,
      request
    );
  }

  atualizar(
    id: number,
    request: AvisoRequest
  ): Observable<AvisoResponse> {
    return this.http.put<AvisoResponse>(
      `${this.url}/${id}`,
      request
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`
    );
  }
}