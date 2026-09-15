import type { ISessaoRepository } from "../../../repositories/ISessaoRepository.js";
import type { Sessao } from "../../../entities/Sessao.js";
import { Prisma } from "@prisma/client";
import type { Sessao as SessaoPrisma } from "@prisma/client";
import { prisma } from "./client.js";

type SessaoComSlots = SessaoPrisma & { slots: { id: number }[] };

const incluirSlots = { slots: { select: { id: true } } } as const;

export class SessaoRepositoryPrisma implements ISessaoRepository {
  async criar(sessao: Sessao): Promise<Sessao> {
    const criada = await prisma.sessao.create({
      data: {
        // O id é gerado pelo banco (autoincrement)
        mentorId: sessao.mentorId,
        mentoradoId: sessao.mentoradoId,
        disciplinaId: sessao.disciplinaId,
        dataHora: sessao.dataHora,
        duracaoMinutos: sessao.duracaoMinutos,
        linkReuniao: sessao.linkReuniao,
        status: sessao.status,
        ...(sessao.feedbackMentorado !== undefined
          ? { feedbackMentorado: sessao.feedbackMentorado }
          : {}),
        slots: { connect: sessao.slots.map((slotId) => ({ id: slotId })) },
      },
      include: incluirSlots,
    });
    return this.toSessao(criada);
  }

  async buscarPorId(id: number): Promise<Sessao | undefined> {
    const sessao = await prisma.sessao.findUnique({
      where: { id },
      include: incluirSlots,
    });
    return sessao ? this.toSessao(sessao) : undefined;
  }

  async buscarPorMentorado(id: number): Promise<Sessao[] | undefined> {
    const sessoes = await prisma.sessao.findMany({
      where: { mentoradoId: id },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return sessoes.map((sessao) => this.toSessao(sessao));
  }

  async buscarAgendadasPorMentorado(id: number): Promise<Sessao[] | undefined> {
    const sessoes = await prisma.sessao.findMany({
      where: { mentoradoId: id, status: "agendada" },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return sessoes.map((sessao) => this.toSessao(sessao));
  }

  async buscarConcluidasPorMentorado(id: number): Promise<Sessao[] | undefined> {
    const sessoes = await prisma.sessao.findMany({
      where: { mentoradoId: id, status: "concluida" },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return sessoes.map((sessao) => this.toSessao(sessao));
  }

  async buscarPorMentor(id: number): Promise<Sessao[] | undefined> {
    const sessoes = await prisma.sessao.findMany({
      where: { mentorId: id },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return sessoes.map((sessao) => this.toSessao(sessao));
  }

  async buscarAgendadasPorMentor(id: number): Promise<Sessao[] | undefined> {
    const sessoes = await prisma.sessao.findMany({
      where: { mentorId: id, status: "agendada" },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return sessoes.map((sessao) => this.toSessao(sessao));
  }

  async buscarConcluidasPorMentor(id: number): Promise<Sessao[] | undefined> {
    const sessoes = await prisma.sessao.findMany({
      where: { mentorId: id, status: "concluida" },
      include: incluirSlots,
      orderBy: { id: "asc" },
    });
    return sessoes.map((sessao) => this.toSessao(sessao));
  }

  async atualizarStatus(
    id: number,
    status: "agendada" | "concluida" | "cancelada",
  ): Promise<Sessao | undefined> {
    try {
      const atualizada = await prisma.sessao.update({
        where: { id },
        data: { status },
        include: incluirSlots,
      });
      return this.toSessao(atualizada);
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

  async atualizar(sessao: Sessao): Promise<Sessao | undefined> {
    try {
      const atualizada = await prisma.sessao.update({
        where: { id: sessao.id },
        data: {
          dataHora: sessao.dataHora,
          duracaoMinutos: sessao.duracaoMinutos,
          linkReuniao: sessao.linkReuniao,
          status: sessao.status,
          ...(sessao.feedbackMentorado !== undefined
            ? { feedbackMentorado: sessao.feedbackMentorado }
            : {}),
          slots: { set: sessao.slots.map((slotId) => ({ id: slotId })) },
        },
        include: incluirSlots,
      });
      return this.toSessao(atualizada);
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
      await prisma.sessao.delete({ where: { id } });
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

  private toSessao(sessao: SessaoComSlots): Sessao {
    const base: Sessao = {
      id: sessao.id,
      mentorId: sessao.mentorId,
      mentoradoId: sessao.mentoradoId,
      disciplinaId: sessao.disciplinaId,
      dataHora: sessao.dataHora,
      duracaoMinutos: sessao.duracaoMinutos,
      linkReuniao: sessao.linkReuniao,
      status: sessao.status as Sessao["status"],
      slots: sessao.slots.map((slot) => slot.id),
    };

    // O campo é nullable no banco e opcional na entidade.
    return sessao.feedbackMentorado !== null
      ? { ...base, feedbackMentorado: sessao.feedbackMentorado }
      : base;
  }
}
