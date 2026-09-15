import type { IDisciplinaRepository } from "../../../repositories/IDisciplinaRepository.js";
import type { Disciplina } from "../../../entities/Disciplina.js";
import { Prisma } from "@prisma/client";
import { prisma } from "./client.js";

export class DisciplinaRepositoryPrisma implements IDisciplinaRepository {
  async buscarPorId(id: number): Promise<Disciplina | undefined> {
    const disciplina = await prisma.disciplina.findUnique({ where: { id } });
    return disciplina ?? undefined;
  }

  async buscarTodos(): Promise<Disciplina[]> {
    return prisma.disciplina.findMany({ orderBy: { id: "asc" } });
  }

  async criar(disciplina: Disciplina): Promise<Disciplina> {
    return prisma.disciplina.create({
      data: {
        // O id é gerado pelo banco (autoincrement)
        nome: disciplina.nome,
        descricao: disciplina.descricao,
      },
    });
  }

  async atualizar(disciplina: Disciplina): Promise<Disciplina | undefined> {
    try {
      return await prisma.disciplina.update({
        where: { id: disciplina.id },
        data: {
          nome: disciplina.nome,
          descricao: disciplina.descricao,
        },
      });
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
      await prisma.disciplina.delete({ where: { id } });
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
}
