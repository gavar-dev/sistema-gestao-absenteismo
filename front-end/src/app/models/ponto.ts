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

export interface ResumoPontoResponse {
  totalRegistros: number;
  jornadasFinalizadas: number;
  jornadasEmAndamento: number;
  quantidadeAtrasos: number;
  quantidadeFaltas: number;
  quantidadePendencias: number;
  totalMinutosAtraso: number;
  mediaMinutosAtraso: number;
  totalMinutosTrabalhados: number;
}

export interface IndicadorSetorResponse {
  setor: string;
  totalRegistros: number;
  atrasos: number;
  faltas: number;
  pendencias: number;
}

export interface RankingAtrasoResponse {
  funcionarioId: number;
  nomeFuncionario: string;
  setor: string;
  quantidadeAtrasos: number;
  totalMinutosAtraso: number;
  mediaMinutosAtraso: number;
}