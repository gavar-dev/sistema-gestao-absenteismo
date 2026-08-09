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
  primeiroAcesso: boolean;
  token: string;
  tipoToken: string;
  expiraEm: string;
}

export interface AlterarSenhaRequest {
  email: string;
  senhaAtual: string;
  novaSenha: string;
}

export interface PrimeiroAcessoRequest {
  novaSenha: string;
  confirmacaoSenha: string;
}

export interface RecuperarSenhaRequest {
  email: string;
  cpf: string;
  matricula: string;
  dataNascimento: string;
  novaSenha: string;
  confirmacaoSenha: string;
}