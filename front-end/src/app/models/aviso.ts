export type NivelAviso =
  | 'INFORMATIVO'
  | 'SUCESSO'
  | 'ALERTA'
  | 'URGENTE';

export type DestinoAviso =
  | 'TODOS'
  | 'TIPO_ACESSO'
  | 'SETOR';

export type TipoAcessoAviso =
  | 'FUNCIONARIO'
  | 'RH'
  | 'GESTOR';

export interface AvisoRequest {
  titulo: string;
  mensagem: string;
  nivel: NivelAviso;
  destino: DestinoAviso;
  tipoAcessoAlvo?: TipoAcessoAviso;
  setorAlvo?: string;
  publicadoEm?: string;
  expiraEm?: string;
}

export interface AvisoResponse {
  id: number;
  titulo: string;
  mensagem: string;
  nivel: NivelAviso;
  destino: DestinoAviso;
  tipoAcessoAlvo: TipoAcessoAviso | null;
  setorAlvo: string | null;
  ativo: boolean;
  publicadoEm: string;
  expiraEm: string | null;
  criadoPorId: number;
  nomeCriadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}