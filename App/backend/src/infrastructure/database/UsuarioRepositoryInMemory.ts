import type { IUsuarioRepository } from "../../repositories/IUsuarioRepository.js";
import type { Usuario } from "../../entities/Usuario.js";

export class UsuarioRepositoryInMemory implements IUsuarioRepository {
  private usuarios: Usuario[] = [];

  buscarPorId(id: number): Usuario | undefined {
    return this.usuarios.find((usuario) => usuario.id === id);
  }

  buscarPorEmail(email: string): Usuario | undefined {
    return this.usuarios.find((usuario) => usuario.email === email);
  }

  listarTodos(): Usuario[] {
    return this.usuarios;
  }

  criar(usuario: Usuario): Usuario {
    const novoId =
      this.usuarios.length > 0
        ? Math.max(...this.usuarios.map((u) => u.id)) + 1
        : 1;
    usuario.id = novoId;
    this.usuarios.push(usuario);
    return usuario;
  }

  atualizar(usuario: Usuario): Usuario | undefined {
    const index = this.usuarios.findIndex((u) => u.id === usuario.id);
    if (index !== -1) {
      this.usuarios[index] = usuario;
      return usuario;
    }
    return undefined;
  }

  deletar(id: number): boolean {
    const index = this.usuarios.findIndex((usuario) => usuario.id === id);
    if (index !== -1) {
      this.usuarios.splice(index, 1);
      return true;
    }
    return false;
  }
}
