import type { Slot } from "../../entities/Slot.js";
import type { ISlotRepository } from "../../repositories/ISlotRepository.js";

export class SlotRepositoryInMemory implements ISlotRepository {
  private slots: Slot[] = [];

  criar(slot: Slot): Slot {
    const novoId =
      this.slots.length > 0 ? Math.max(...this.slots.map((s) => s.id)) + 1 : 1;
    slot.id = novoId;
    this.slots.push(slot);
    return slot;
  }

  buscarPorMentor(id: number): Slot[] | undefined {
    return this.slots.filter((slot) => slot.mentorId === id);
  }

  buscarDisponiveisPorMentor(id: number): Slot[] | undefined {
    return this.slots.filter(
      (slot) => slot.mentorId === id && slot.status === "disponivel",
    );
  }

  buscarPorDisciplina(id: number): Slot[] | undefined {
    return this.slots.filter((slot) => slot.disciplinaId === id);
  }

  buscarDisponiveisPorDisciplina(id: number): Slot[] | undefined {
    return this.slots.filter(
      (slot) => slot.disciplinaId === id && slot.status === "disponivel",
    );
  }

  atualizarStatus(
    id: number,
    status: "disponivel" | "indisponivel",
  ): Slot | undefined {
    const slot = this.slots.find((slot) => slot.id === id);
    if (slot) {
      slot.status = status;
      return slot;
    }
    return undefined;
  }

  atualizar(slot: Slot): Slot | undefined {
    const index = this.slots.findIndex((s) => s.id === slot.id);
    if (index !== -1) {
      this.slots[index] = slot;
      return slot;
    }
    return undefined;
  }

  deletar(id: number): boolean {
    const index = this.slots.findIndex((slot) => slot.id === id);
    if (index !== -1) {
      this.slots.splice(index, 1);
      return true;
    }
    return false;
  }
}
