import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { Usuario } from "../entities/Usuario.js";
import type { CriarUsuarioDTO, DadosBasicosUsuarioDTO } from "./dtos/UsuarioDTO.js";
import bcrypt from "bcryptjs";
import type { ISlotRepository } from "../repositories/ISlotRepository.js";

const SALT_ROUNDS = 10;

export class UsuarioService {
  constructor(private usuarioRepository: IUsuarioRepository, private slotRepository: ISlotRepository) {}

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
      disciplinas: [],
    });
  }

  buscarUsuarioPorId(id: number): Usuario | undefined {
    return this.usuarioRepository.buscarPorId(id);
  }

  buscarUsuarioPorEmail(email: string): Usuario | undefined {
    return this.usuarioRepository.buscarPorEmail(email);
  }

  buscarMentoresPorDisciplina(disciplinaId: number): DadosBasicosUsuarioDTO[] {

    const todosMentores = this.usuarioRepository.listarTodos().filter((usuario) => {
      return usuario.perfil === "mentor" && usuario.disciplinas.some((disciplina) => disciplina.id === disciplinaId);
    });

    // Lista de mentores que possuem slots disponíveis para a disciplina especificada
    let mentoresComSlotsDisponiveis: Usuario[] = [];
    for (const mentor of todosMentores) {
      const slotsDisponiveis = this.slotRepository.buscarDisponiveisPorMentor(mentor.id);
      if (slotsDisponiveis && slotsDisponiveis.length > 0) {
        if (!mentoresComSlotsDisponiveis.some((m) => m.id === mentor.id)) {
          mentoresComSlotsDisponiveis.push(mentor);
        }
      }
    }

    return mentoresComSlotsDisponiveis.map((mentor) => ({
      id: mentor.id.toString(),
      nome: mentor.nome,
      email: mentor.email,
      perfil: mentor.perfil,
    }));
  }
}
