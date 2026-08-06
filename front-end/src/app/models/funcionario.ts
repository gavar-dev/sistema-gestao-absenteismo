import { TipoUsuario } from './tipoUsuario';

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
  tipoVinculo: string | null;
  cargaHorariaSemanal: number | null;
  gestorImediato: string | null;
  localTrabalho: string | null;
  tipoAcesso: TipoUsuario;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
}