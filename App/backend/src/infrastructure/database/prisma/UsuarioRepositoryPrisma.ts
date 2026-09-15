import type { IUsuarioRepository } from "../../../repositories/IUsuarioRepository.js";
import type { Usuario } from "../../../entities/Usuario.js";
import { Prisma } from "@prisma/client";
import type {
  Disciplina as DisciplinaPrisma,
  Usuario as UsuarioPrisma,
} from "@prisma/client";
import { prisma } from "./client.js";

type UsuarioComDisciplinas = UsuarioPrisma & {
  disciplinas: DisciplinaPrisma[];
};

export class UsuarioRepositoryPrisma implements IUsuarioRepository {
  async buscarPorId(id: number): Promise<Usuario | undefined> {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: { disciplinas: true },
    });
    return usuario ? this.toUsuario(usuario) : undefined;
  }

  async listarTodos(): Promise<Usuario[]> {
    const usuarios = await prisma.usuario.findMany({
      include: { disciplinas: true },
      orderBy: { id: "asc" },
    });
    return usuarios.map((usuario) => this.toUsuario(usuario));
  }

  async buscarPorEmail(email: string): Promise<Usuario | undefined> {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { disciplinas: true },
    });
    return usuario ? this.toUsuario(usuario) : undefined;
  }

  async criar(usuario: Usuario): Promise<Usuario> {
    const criado = await prisma.usuario.create({
      data: {
        // O id é gerado pelo banco (autoincrement)
        nome: usuario.nome,
        email: usuario.email,
        senhaHash: usuario.senhaHash,
        perfil: usuario.perfil,
        dataCriacao: usuario.dataCriacao,
        disciplinas: {
          connect: usuario.disciplinas.map((disciplina) => ({
            id: disciplina.id,
          })),
        },
      },
      include: { disciplinas: true },
    });
    return this.toUsuario(criado);
  }

  async atualizar(usuario: Usuario): Promise<Usuario | undefined> {
    try {
      const atualizado = await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          nome: usuario.nome,
          email: usuario.email,
          senhaHash: usuario.senhaHash,
          perfil: usuario.perfil,
          disciplinas: {
            set: usuario.disciplinas.map((disciplina) => ({
              id: disciplina.id,
            })),
          },
        },
        include: { disciplinas: true },
      });
      return this.toUsuario(atualizado);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return undefined;
      }
      throw error;
    }
  }

  async deletar(id: number): Promise<boolean> {
    try {
      await prisma.usuario.delete({ where: { id } });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return false;
      }
      throw error;
    }
  }

  private toUsuario(usuario: UsuarioComDisciplinas): Usuario {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      dataCriacao: usuario.dataCriacao,
      perfil: usuario.perfil as Usuario["perfil"],
      disciplinas: usuario.disciplinas.map((disciplina) => ({
        id: disciplina.id,
        nome: disciplina.nome,
        descricao: disciplina.descricao,
      })),
    };
  }
}
