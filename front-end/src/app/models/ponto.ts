export type TipoMarcacao =
  | 'ENTRADA'
  | 'INICIO_INTERVALO'
  | 'FIM_INTERVALO'
  | 'SAIDA';

export type StatusJornada =
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'PENDENTE'
  | 'ATRASO'
  | 'FALTA'
  | 'JUSTIFICADA';

export interface MarcacaoPontoRequest {
  tipo: TipoMarcacao;
}

export interface RegistroPontoResponse {
  id: number;
  funcionarioId: number;
  nomeFuncionario: string;
  dataRegistro: string;
  entrada: string | null;
  inicioIntervalo: string | null;
  fimIntervalo: string | null;
  saida: string | null;
  status: StatusJornada;
  atrasoMinutos: number;
  totalTrabalhadoMinutos: number;
  proximaMarcacao: TipoMarcacao | null;
}