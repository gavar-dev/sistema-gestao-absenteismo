import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  IndicadorSetorResponse,
  MarcacaoPontoRequest,
  RegistroPontoResponse,
  ResumoPontoResponse,
  StatusJornada,
  TipoMarcacao,
} from '../../models/ponto';

@Injectable({
  providedIn: 'root',
})
export class PontoService {
  private readonly url =
    `${environment.apiUrl}/pontos`;

  constructor(
    private readonly http: HttpClient
  ) {}

  buscarHoje():
    Observable<RegistroPontoResponse | null> {

    return this.http.get<
      RegistroPontoResponse | null
    >(
      `${this.url}/hoje`
    );
  }

  marcar(
    tipo: TipoMarcacao
  ): Observable<RegistroPontoResponse> {

    const request:
      MarcacaoPontoRequest = {
        tipo,
      };

    return this.http.post<
      RegistroPontoResponse
    >(
      `${this.url}/marcar`,
      request
    );
  }

  buscarMeuHistorico():
    Observable<RegistroPontoResponse[]> {

    return this.http.get<
      RegistroPontoResponse[]
    >(
      `${this.url}/meu-historico`
    );
  }

  buscarRegistrosGerenciais(
    inicio: string,
    fim: string,
    status?: StatusJornada,
    funcionarioId?: number
  ): Observable<RegistroPontoResponse[]> {

    const params:
      Record<string, string> = {
        inicio,
        fim,
      };

    if (status) {
      params['status'] = status;
    }

    if (funcionarioId !== undefined) {
      params['funcionarioId'] =
        String(funcionarioId);
    }

    return this.http.get<
      RegistroPontoResponse[]
    >(
      this.url,
      {
        params,
      }
    );
  }

  buscarResumoGerencial(
    inicio: string,
    fim: string,
    funcionarioId?: number
  ): Observable<ResumoPontoResponse> {

    const params:
      Record<string, string> = {
        inicio,
        fim,
      };

    if (funcionarioId !== undefined) {
      params['funcionarioId'] =
        String(funcionarioId);
    }

    return this.http.get<
      ResumoPontoResponse
    >(
      `${this.url}/resumo`,
      {
        params,
      }
    );
  }

  buscarIndicadoresPorSetor(
    inicio: string,
    fim: string
  ): Observable<IndicadorSetorResponse[]> {

    return this.http.get<
      IndicadorSetorResponse[]
    >(
      `${this.url}/indicadores/por-setor`,
      {
        params: {
          inicio,
          fim,
        },
      }
    );
  }
}