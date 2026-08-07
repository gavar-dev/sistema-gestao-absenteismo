import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  criar(
    request: FuncionarioCreateRequest
  ): Observable<FuncionarioResponse> {

    return this.http.post<FuncionarioResponse>(
      this.url,
      request
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

    const request: FuncionarioStatusRequest = {
      status,
    };

    return this.http.patch<FuncionarioResponse>(
      `${this.url}/${id}/status`,
      request
    );
  }

  desativar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`
    );
  }
}