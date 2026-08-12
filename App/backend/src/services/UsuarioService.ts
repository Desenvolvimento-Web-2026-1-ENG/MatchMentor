/*
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  dataCriacao: Date;
  perfil: "mentor" | "mentorado";
}

export interface Mentorado extends Usuario {
  disciplinasInteresse: Disciplina[];
}

export interface Mentor extends Usuario {
  disciplinasMentoradas: Disciplina[];
}
*/
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

    if (usuario.perfil === "mentor") {
      // Aqui você pode adicionar lógica específica para mentores, se necessário
    }

    return this.usuarioRepository.criar({
      id: 0, // O ID será gerado pelo repositório
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: senhaHash,
      perfil: usuario.perfil,
      dataCriacao: new Date(),
      disciplinas: [],
    });
  }

  buscarUsuarioPorId(id: number): Usuario | undefined {
    return this.usuarioRepository.buscarPorId(id);
  }

  buscarUsuarioPorEmail(email: string): Usuario | undefined {
    return this.usuarioRepository.buscarPorEmail(email);
  }
}
