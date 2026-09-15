import type { IUsuarioRepository } from "../../repositories/IUsuarioRepository.js";
import type { Usuario } from "../../entities/Usuario.js";

export class UsuarioRepositoryInMemory implements IUsuarioRepository {
  private usuarios: Usuario[] = [];

  async buscarPorId(id: number): Promise<Usuario | undefined> {
    return this.usuarios.find((usuario) => usuario.id === id);
  }

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    return this.usuarios.find((usuario) => usuario.email === email);
  }

  async listarTodos(): Promise<Usuario[]> {
    return this.usuarios;
  }

  async criar(usuario: Usuario): Promise<Usuario> {
    const novoId =
      this.usuarios.length > 0
        ? Math.max(...this.usuarios.map((u) => u.id)) + 1
        : 1;
    usuario.id = novoId;
    this.usuarios.push(usuario);
    return usuario;
  }

  async atualizar(usuario: Usuario): Promise<Usuario | undefined> {
    const index = this.usuarios.findIndex((u) => u.id === usuario.id);
    if (index !== -1) {
      this.usuarios[index] = usuario;
      return usuario;
    }
    return undefined;
  }

  async deletar(id: number): Promise<boolean> {
    const index = this.usuarios.findIndex((usuario) => usuario.id === id);
    if (index !== -1) {
      this.usuarios.splice(index, 1);
      return true;
    }
    return false;
  }
}
