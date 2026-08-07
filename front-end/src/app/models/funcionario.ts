import { TipoUsuario } from './tipoUsuario';

export type StatusFuncionario =
  | 'Ativo'
  | 'Férias'
  | 'Afastado'
  | 'Inativo';

export type TipoVinculo =
  | 'CLT'
  | 'PJ'
  | 'Estágio'
  | 'Temporário'
  | 'Aprendiz';

export interface FuncionarioResponse {
  id: number;
  nomeCompleto: string;
  emailCorporativo: string;
  cpf: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  estadoCivil: string | null;
  nacionalidade: string | null;
  naturalidade: string | null;
  matricula: string;
  cargo: string;
  setor: string;
  dataAdmissao: string | null;
  tipoVinculo: TipoVinculo | null;
  cargaHorariaSemanal: number | null;
  gestorImediato: string | null;
  localTrabalho: string | null;
  tipoAcesso: TipoUsuario;
  status: StatusFuncionario;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FuncionarioCreateRequest {
  nomeCompleto: string;
  emailCorporativo: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  estadoCivil: string | null;
  nacionalidade: string;
  naturalidade: string | null;
  matricula: string;
  cargo: string;
  setor: string;
  dataAdmissao: string;
  tipoVinculo: TipoVinculo;
  cargaHorariaSemanal: number | null;
  gestorImediato: string | null;
  localTrabalho: string | null;
  tipoAcesso: TipoUsuario;
  status: StatusFuncionario;
  senhaProvisoria: string;
}

export interface FuncionarioUpdateRequest {
  nomeCompleto: string;
  emailCorporativo: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  estadoCivil: string | null;
  nacionalidade: string;
  naturalidade: string | null;
  matricula: string;
  cargo: string;
  setor: string;
  dataAdmissao: string;
  tipoVinculo: TipoVinculo;
  cargaHorariaSemanal: number | null;
  gestorImediato: string | null;
  localTrabalho: string | null;
  tipoAcesso: TipoUsuario;
  status: StatusFuncionario;
}

export interface FuncionarioStatusRequest {
  status: StatusFuncionario;
}