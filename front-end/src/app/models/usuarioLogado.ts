import { TipoUsuario } from "./tipoUsuario";

export interface UsuarioLogado {
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  iniciais: string;
  tipo: TipoUsuario;
}