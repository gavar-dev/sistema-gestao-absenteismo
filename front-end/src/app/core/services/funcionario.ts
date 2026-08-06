import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FuncionarioResponse } from '../../models/funcionario';

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

    return this.http.get<
      FuncionarioResponse
    >(
      `${this.url}/me`
    );
  }

  listar(
    status?: string
  ): Observable<FuncionarioResponse[]> {

    if (status) {
      return this.http.get<
        FuncionarioResponse[]
      >(
        this.url,
        {
          params: {
            status,
          },
        }
      );
    }

    return this.http.get<
      FuncionarioResponse[]
    >(
      this.url
    );
  }

  buscarPorId(
    id: number
  ): Observable<FuncionarioResponse> {

    return this.http.get<
      FuncionarioResponse
    >(
      `${this.url}/${id}`
    );
  }
}