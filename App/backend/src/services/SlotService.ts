import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { Slot } from "../entities/Slot.js";
import type { CriarSlotDTO } from "./dtos/SlotDTO.js";

const SLOT_DURATION_MINUTES = 15;

export class SlotService {
  constructor(private slotRepository: ISlotRepository) {}

  async criar(slot: CriarSlotDTO): Promise<Slot[]> {
    if (slot.dataHora.getTime() < Date.now()) {
      throw new Error("Não é possível criar slots com data anterior à atual.");
    }

    const quantidadeSlots = slot.duracaoTotalMinutos / SLOT_DURATION_MINUTES;
    const slotsCriados: Slot[] = [];

    for (let i = 0; i < quantidadeSlots; i++) {
      const dataHora = new Date(
        slot.dataHora.getTime() + i * SLOT_DURATION_MINUTES * 60_000,
      );
      slotsCriados.push(
        await this.slotRepository.criar({
          id: 0, // O ID será gerado pelo repositório
          mentorId: slot.mentorId,
          disciplinaId: 0,
          dataHora,
          duracaoMinutos: SLOT_DURATION_MINUTES,
          status: "disponivel",
        }),
      );
    }

    return slotsCriados;
  }

  async buscarPorMentor(id: number): Promise<Slot[] | undefined> {
    return this.slotRepository.buscarPorMentor(id);
  }

  async buscarDisponiveisPorMentor(id: number): Promise<Slot[] | undefined> {
    const slots = await this.slotRepository.buscarDisponiveisPorMentor(id);
    return slots?.filter((slot) => slot.dataHora > new Date());
  }

  async buscarPorDisciplina(id: number): Promise<Slot[] | undefined> {
    return this.slotRepository.buscarPorDisciplina(id);
  }

  async atualizarStatus(
    id: number,
    status: "disponivel" | "indisponivel",
  ): Promise<Slot | undefined> {
    return this.slotRepository.atualizarStatus(id, status);
  }

  async deletar(id: number): Promise<boolean> {
    const slot = await this.slotRepository.buscarPorId(id);
    if (!slot) {
      throw new Error("Slot não encontrado");
    }
    if (slot.status !== "disponivel") {
      throw new Error("Não é possível deletar um slot que não está disponível");
    }
    return this.slotRepository.deletar(id);
  }
}
