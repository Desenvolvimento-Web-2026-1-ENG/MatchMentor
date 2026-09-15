import type { ISlotRepository } from "../../../repositories/ISlotRepository.js";
import type { Slot } from "../../../entities/Slot.js";
import { Prisma } from "@prisma/client";
import type { Slot as SlotPrisma } from "@prisma/client";
import { prisma } from "./client.js";

export class SlotRepositoryPrisma implements ISlotRepository {
  async criar(slot: Slot): Promise<Slot> {
    const criado = await prisma.slot.create({
      data: {
        // O id é gerado pelo banco (autoincrement)
        mentorId: slot.mentorId,
        disciplinaId: slot.disciplinaId,
        dataHora: slot.dataHora,
        duracaoMinutos: slot.duracaoMinutos,
        status: slot.status,
      },
    });
    return this.toSlot(criado);
  }

  async buscarPorId(id: number): Promise<Slot | undefined> {
    const slot = await prisma.slot.findUnique({ where: { id } });
    return slot ? this.toSlot(slot) : undefined;
  }

  async buscarPorMentor(id: number): Promise<Slot[] | undefined> {
    const slots = await prisma.slot.findMany({
      where: { mentorId: id },
      orderBy: { id: "asc" },
    });
    return slots.map((slot) => this.toSlot(slot));
  }

  async buscarDisponiveisPorMentor(id: number): Promise<Slot[] | undefined> {
    const slots = await prisma.slot.findMany({
      where: { mentorId: id, status: "disponivel" },
      orderBy: { id: "asc" },
    });
    return slots.map((slot) => this.toSlot(slot));
  }

  async buscarPorDisciplina(id: number): Promise<Slot[] | undefined> {
    const slots = await prisma.slot.findMany({
      where: { disciplinaId: id },
      orderBy: { id: "asc" },
    });
    return slots.map((slot) => this.toSlot(slot));
  }

  async atualizarStatus(
    id: number,
    status: "disponivel" | "indisponivel",
  ): Promise<Slot | undefined> {
    try {
      const atualizado = await prisma.slot.update({
        where: { id },
        data: { status },
      });
      return this.toSlot(atualizado);
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

  async atualizar(slot: Slot): Promise<Slot | undefined> {
    try {
      const atualizado = await prisma.slot.update({
        where: { id: slot.id },
        data: {
          mentorId: slot.mentorId,
          disciplinaId: slot.disciplinaId,
          dataHora: slot.dataHora,
          duracaoMinutos: slot.duracaoMinutos,
          status: slot.status,
        },
      });
      return this.toSlot(atualizado);
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
      await prisma.slot.delete({ where: { id } });
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

  private toSlot(slot: SlotPrisma): Slot {
    return {
      id: slot.id,
      mentorId: slot.mentorId,
      disciplinaId: slot.disciplinaId,
      dataHora: slot.dataHora,
      duracaoMinutos: slot.duracaoMinutos,
      status: slot.status as Slot["status"],
    };
  }
}
