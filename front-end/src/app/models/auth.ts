import { TipoUsuario } from './tipoUsuario';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  id: number;
  nomeCompleto: string;
  emailCorporativo: string;
  matricula: string;
  tipoAcesso: TipoUsuario;
  token: string;
  tipoToken: string;
  expiraEm: string;
}

export interface AlterarSenhaRequest {
  email: string;
  senhaAtual: string;
  novaSenha: string;
}