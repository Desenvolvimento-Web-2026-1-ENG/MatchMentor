import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { Usuario } from "../entities/Usuario.js";
import type { CriarUsuarioDTO, DadosBasicosUsuarioDTO } from "./dtos/UsuarioDTO.js";
import bcrypt from "bcryptjs";
import type { ISlotRepository } from "../repositories/ISlotRepository.js";

const SALT_ROUNDS = 10;

export class UsuarioService {
  constructor(private usuarioRepository: IUsuarioRepository, private slotRepository: ISlotRepository) {}

  async criarUsuario(usuario: CriarUsuarioDTO): Promise<Usuario> {
    if (await this.usuarioRepository.buscarPorEmail(usuario.email)) {
      throw new Error("Este e-mail já está cadastrado.");
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

  async listarUsuarios(): Promise<DadosBasicosUsuarioDTO[]> {
    const usuarios = await this.usuarioRepository.listarTodos();
    return usuarios.map((usuario) => this.mapUsuarioToDTO(usuario));
  }

  async obterUsuarioPorId(id: number): Promise<DadosBasicosUsuarioDTO | undefined> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    return usuario ? this.mapUsuarioToDTO(usuario) : undefined;
  }

  async buscarUsuarioPorId(id: number): Promise<Usuario | undefined> {
    return this.usuarioRepository.buscarPorId(id);
  }

  async buscarUsuarioPorEmail(email: string): Promise<Usuario | undefined> {
    return this.usuarioRepository.buscarPorEmail(email);
  }

  async buscarMentoresPorDisciplina(
    disciplinaId: number,
  ): Promise<DadosBasicosUsuarioDTO[]> {
    const todosMentores = (await this.usuarioRepository.listarTodos()).filter(
      (usuario) => {
        return (
          usuario.perfil === "mentor" &&
          usuario.disciplinas.some((disciplina) => disciplina.id === disciplinaId)
        );
      },
    );

    // Lista de mentores que possuem slots disponíveis futuros para a disciplina especificada
    let mentoresComSlotsDisponiveis: Usuario[] = [];
    for (const mentor of todosMentores) {
      const slotsDisponiveis = await this.slotRepository.buscarDisponiveisPorMentor(
        mentor.id,
      );
      const possuiSlotsFuturos = slotsDisponiveis?.some(
        (slot) => slot.dataHora.getTime() > Date.now(),
      );
      if (possuiSlotsFuturos) {
        if (!mentoresComSlotsDisponiveis.some((m) => m.id === mentor.id)) {
          mentoresComSlotsDisponiveis.push(mentor);
        }
      }
    }

    return mentoresComSlotsDisponiveis.map((mentor) => this.mapUsuarioToDTO(mentor));
  }

  private mapUsuarioToDTO(usuario: Usuario): DadosBasicosUsuarioDTO {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      disciplinas: usuario.disciplinas.map((disciplina) => ({
        id: disciplina.id,
        nome: disciplina.nome,
      })),
    };
  }
}
