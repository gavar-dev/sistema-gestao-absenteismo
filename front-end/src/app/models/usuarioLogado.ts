import { TipoUsuario } from './tipoUsuario';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  setor: string;
  iniciais: string;
  tipo: TipoUsuario;
}