import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  SolicitacaoCreateRequest,
  SolicitacaoResponse,
} from '../../models/solicitacao';

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  
  private readonly url = `${environment.apiUrl}/solicitacoes`;

  constructor(private readonly http: HttpClient) {}

  criar(request: SolicitacaoCreateRequest): Observable<SolicitacaoResponse> {
    return this.http.post<SolicitacaoResponse>(this.url,request);
  }

  listarMinhas():
    Observable<SolicitacaoResponse[]> {

    return this.http.get<SolicitacaoResponse[]>(`${this.url}/minhas`);
  }
}