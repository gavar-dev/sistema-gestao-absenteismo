import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  SolicitacaoAprovacaoRequest,
  SolicitacaoCreateRequest,
  SolicitacaoRejeicaoRequest,
  SolicitacaoResponse,
  StatusSolicitacao,
} from '../../models/solicitacao';

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {

  private readonly url =
    `${environment.apiUrl}/solicitacoes`;

  constructor(
    private readonly http: HttpClient
  ) {}

  visualizarAnexo(
    id: number
  ): Observable<Blob> {
    return this.http.get(
      `${this.url}/${id}/anexo/visualizar`,
      {
        responseType: 'blob',
      }
    );
  }

  baixarAnexo(
    id: number
  ): Observable<Blob> {
    return this.http.get(
      `${this.url}/${id}/anexo/download`,
      {
        responseType: 'blob',
      }
    );
  }

  criar(
    request: SolicitacaoCreateRequest,
    anexo: File | null = null
  ): Observable<SolicitacaoResponse> {

    if (!anexo) {
      return this.http.post<SolicitacaoResponse>(
        this.url,
        request
      );
    }

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

    formulario.append(
      'anexo',
      anexo,
      anexo.name
    );

    return this.http.post<SolicitacaoResponse>(
      this.url,
      formulario
    );
  }

  listarMinhas():
    Observable<SolicitacaoResponse[]> {

    return this.http.get<SolicitacaoResponse[]>(
      `${this.url}/minhas`
    );
  }

  listarGerencial(
    status?: StatusSolicitacao
  ): Observable<SolicitacaoResponse[]> {
    if (status) {
      return this.http.get<SolicitacaoResponse[]>(
        this.url,
        {
          params: {
            status,
          },
        }
      );
    }

    return this.http.get<SolicitacaoResponse[]>(
      this.url
    );
  }

  buscarPorId(
    id: number
  ): Observable<SolicitacaoResponse> {
    return this.http.get<SolicitacaoResponse>(
      `${this.url}/${id}`
    );
  }

  aprovar(
    id: number,
    request: SolicitacaoAprovacaoRequest
  ): Observable<SolicitacaoResponse> {
    return this.http.patch<SolicitacaoResponse>(
      `${this.url}/${id}/aprovar`,
      request
    );
  }

  rejeitar(
    id: number,
    request: SolicitacaoRejeicaoRequest
  ): Observable<SolicitacaoResponse> {
    return this.http.patch<SolicitacaoResponse>(
      `${this.url}/${id}/rejeitar`,
      request
    );
  }
}