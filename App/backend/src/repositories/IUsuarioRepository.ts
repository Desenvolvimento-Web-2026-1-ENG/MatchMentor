import type { Usuario } from "../entities/Usuario.js";

export interface IUsuarioRepository {
  buscarPorId(id: number): Promise<Usuario | undefined>;
  listarTodos(): Promise<Usuario[]>;
  buscarPorEmail(email: string): Promise<Usuario | undefined>;
  criar(usuario: Usuario): Promise<Usuario>;
  atualizar(usuario: Usuario): Promise<Usuario | undefined>;
  deletar(id: number): Promise<boolean>;
}
