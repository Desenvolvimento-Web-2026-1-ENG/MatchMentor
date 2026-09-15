import type { Slot } from "../../entities/Slot.js";
import type { ISlotRepository } from "../../repositories/ISlotRepository.js";

export class SlotRepositoryInMemory implements ISlotRepository {
  private slots: Slot[] = [];

  async criar(slot: Slot): Promise<Slot> {
    const novoId =
      this.slots.length > 0 ? Math.max(...this.slots.map((s) => s.id)) + 1 : 1;
    slot.id = novoId;
    this.slots.push(slot);
    return slot;
  }

  async buscarPorId(id: number): Promise<Slot | undefined> {
    return this.slots.find((slot) => slot.id === id);
  }

  async buscarPorMentor(id: number): Promise<Slot[] | undefined> {
    return this.slots.filter((slot) => slot.mentorId === id);
  }

  async buscarDisponiveisPorMentor(id: number): Promise<Slot[] | undefined> {
    return this.slots.filter(
      (slot) => slot.mentorId === id && slot.status === "disponivel",
    );
  }

  async buscarPorDisciplina(id: number): Promise<Slot[] | undefined> {
    return this.slots.filter((slot) => slot.disciplinaId === id);
  }

  async atualizarStatus(
    id: number,
    status: "disponivel" | "indisponivel",
  ): Promise<Slot | undefined> {
    const slot = this.slots.find((slot) => slot.id === id);
    if (slot) {
      slot.status = status;
      return slot;
    }
    return undefined;
  }

  async atualizar(slot: Slot): Promise<Slot | undefined> {
    const index = this.slots.findIndex((s) => s.id === slot.id);
    if (index !== -1) {
      this.slots[index] = slot;
      return slot;
    }
    return undefined;
  }

  async deletar(id: number): Promise<boolean> {
    const index = this.slots.findIndex((slot) => slot.id === id);
    if (index !== -1) {
      this.slots.splice(index, 1);
      return true;
    }
    return false;
  }
}
