import type { Usuario } from "../entities/Usuario.js";

export interface IUsuarioRepository {
  buscarPorId(id: number): Usuario | undefined;
  buscarPorEmail(email: string): Usuario | undefined;
  criar(usuario: Usuario): Usuario;
  atualizar(usuario: Usuario): Usuario | undefined;
  deletar(id: number): boolean;
}
