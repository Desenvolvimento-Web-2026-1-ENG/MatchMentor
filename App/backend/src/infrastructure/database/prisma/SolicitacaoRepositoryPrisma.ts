import type { ISolicitacaoRepository } from "../../../repositories/ISolicitacaoRepository.js";
import type { Solicitacao } from "../../../entities/Solicitacao.js";
import { Prisma } from "@prisma/client";
import type { Solicitacao as SolicitacaoPrisma } from "@prisma/client";
import { prisma } from "./client.js";

type SolicitacaoComSlots = SolicitacaoPrisma & { slots: { id: number }[] };

const incluirSlots = { slots: { select: { id: true } } } as const;

export class SolicitacaoRepositoryPrisma implements ISolicitacaoRepository {
  async criar(solicitacao: Solicitacao): Promise<Solicitacao> {
    const criada = await prisma.solicitacao.create({
      data: {
        // O id é gerado pelo banco (autoincrement)
        mentorId: solicitacao.mentorId,
        mentoradoId: solicitacao.mentoradoId,
        disciplinaId: solicitacao.disciplinaId,
        dataHora: solicitacao.dataHora,
        duracaoMinutos: solicitacao.duracaoMinutos,
        status: solicitacao.status,
        slots: {
          connect: solicitacao.slots.map((slotId) => ({ id: slotId })),
        },
      },
      include: incluirSlots,
    });
    return this.toSolicitacao(criada);
  }

  async buscarPorId(id: number): Promise<Solicitacao | undefined> {
    const solicitacao = await prisma.solicitacao.findUnique({
      where: { id },
      include: incluirSlots,
    });
    return solicitacao ? this.toSolicitacao(solicitacao) : undefined;
  }

  async buscarPorAluno(id: number): Promise<Solicitacao[] | undefined> {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: { mentoradoId: id },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return solicitacoes.map((solicitacao) => this.toSolicitacao(solicitacao));
  }

  async buscarPorMentor(id: number): Promise<Solicitacao[] | undefined> {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: { mentorId: id },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return solicitacoes.map((solicitacao) => this.toSolicitacao(solicitacao));
  }

  async buscarPendentesPorMentor(id: number): Promise<Solicitacao[] | undefined> {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: { mentorId: id, status: "pendente" },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return solicitacoes.map((solicitacao) => this.toSolicitacao(solicitacao));
  }

  async atualizarStatus(
    id: number,
    status: "pendente" | "aceita" | "recusada",
  ): Promise<Solicitacao | undefined> {
    try {
      const atualizada = await prisma.solicitacao.update({
        where: { id },
        data: { status },
        include: incluirSlots,
      });
      return this.toSolicitacao(atualizada);
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
      await prisma.solicitacao.delete({ where: { id } });
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

  private toSolicitacao(solicitacao: SolicitacaoComSlots): Solicitacao {
    return {
      id: solicitacao.id,
      mentorId: solicitacao.mentorId,
      mentoradoId: solicitacao.mentoradoId,
      disciplinaId: solicitacao.disciplinaId,
      dataHora: solicitacao.dataHora,
      duracaoMinutos: solicitacao.duracaoMinutos,
      status: solicitacao.status as Solicitacao["status"],
      slots: solicitacao.slots.map((slot) => slot.id),
    };
  }
}
