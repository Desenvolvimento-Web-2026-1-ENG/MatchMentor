import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { Usuario } from "../entities/Usuario.js";
import type { CriarUsuarioDTO } from "./dtos/UsuarioDTO.js";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export class UsuarioService {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  criarUsuario(usuario: CriarUsuarioDTO): Usuario {
    if (this.usuarioRepository.buscarPorEmail(usuario.email)) {
      throw new Error("E-mail já cadastrado");
    }

    let senhaHash = bcrypt.hashSync(usuario.senha, SALT_ROUNDS);

    return this.usuarioRepository.criar({
      id: 0, // O ID será gerado pelo repositório
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: senhaHash,
      perfil: usuario.perfil,
      dataCriacao: new Date(),
    });
  }

  buscarUsuarioPorId(id: number): Usuario | undefined {
    return this.usuarioRepository.buscarPorId(id);
  }

  buscarUsuarioPorEmail(email: string): Usuario | undefined {
    return this.usuarioRepository.buscarPorEmail(email);
  }
}
