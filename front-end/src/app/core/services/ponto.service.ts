import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  MarcacaoPontoRequest,
  RegistroPontoResponse,
  TipoMarcacao,
} from '../../models/ponto';

@Injectable({
  providedIn: 'root',
})
export class PontoService {
  private readonly url = `${environment.apiUrl}/pontos`;

  constructor(private readonly http: HttpClient) {}

  buscarHoje(): Observable<RegistroPontoResponse | null> {
    return this.http.get<RegistroPontoResponse | null>(`${this.url}/hoje`);
  }

  marcar(tipo: TipoMarcacao): Observable<RegistroPontoResponse> {
    const request: MarcacaoPontoRequest = { tipo };

    return this.http.post<RegistroPontoResponse>(
      `${this.url}/marcar`,
      request
    );
  }

  buscarMeuHistorico(): Observable<RegistroPontoResponse[]> {
    return this.http.get<RegistroPontoResponse[]>(
      `${this.url}/meu-historico`
    );
  }
}