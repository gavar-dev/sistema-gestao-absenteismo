export type TipoSolicitacao = | 'CORRECAO_PONTO' | 'JUSTIFICATIVA_FALTA' 
| 'SOLICITACAO_FERIAS' | 'CORRECAO_CADASTRO';

export type StatusSolicitacao = | 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export type PrioridadeSolicitacao = | 'NORMAL' | 'ALTA';

export interface SolicitacaoCreateRequest {

  tipo: TipoSolicitacao;
  prioridade?: PrioridadeSolicitacao;

  dataReferencia?: string;
  dataInicio?: string;
  dataFim?: string;

  entradaSolicitada?: string;
  inicioIntervaloSolicitado?: string;
  fimIntervaloSolicitado?: string;
  saidaSolicitada?: string;

  campoCadastro?: string;
  novoValor?: string;

  justificativa: string;
  nomeAnexo?: string;
}

export interface SolicitacaoResponse {
  
  id: number;
  protocolo: string;

  funcionarioId: number;
  nomeFuncionario: string;
  matricula: string;
  setor: string;
  cargo: string;

  tipo: TipoSolicitacao;
  status: StatusSolicitacao;
  prioridade: PrioridadeSolicitacao;

  registroPontoId: number | null;

  dataReferencia: string | null;
  dataInicio: string | null;
  dataFim: string | null;

  entradaSolicitada: string | null;
  inicioIntervaloSolicitado: string | null;
  fimIntervaloSolicitado: string | null;
  saidaSolicitada: string | null;

  campoCadastro: string | null;
  novoValor: string | null;

  justificativa: string;
  nomeAnexo: string | null;

  observacaoAnalise: string | null;

  analisadoPorId: number | null;
  nomeAnalisadoPor: string | null;

  criadoEm: string;
  atualizadoEm: string;
  analisadoEm: string | null;
}

export interface SolicitacaoAprovacaoRequest {
  observacao?: string;
}

export interface SolicitacaoRejeicaoRequest {
  observacao: string;
}