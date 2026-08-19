import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { Slot } from "../entities/Slot.js";
import type { CriarSlotDTO } from "./dtos/SlotDTO.js";

const SLOT_DURATION_MINUTES = 15;

export class SlotService {
  constructor(private slotRepository: ISlotRepository) {}

  criar(slot: CriarSlotDTO): Slot[] {
    const quantidadeSlots = slot.duracaoTotalMinutos / SLOT_DURATION_MINUTES;
    const slotsCriados: Slot[] = [];

    for (let i = 0; i < quantidadeSlots; i++) {
      const dataHora = new Date(
        slot.dataHora.getTime() + i * SLOT_DURATION_MINUTES * 60_000,
      );
      slotsCriados.push(
        this.slotRepository.criar({
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

  buscarPorMentor(id: number): Slot[] | undefined {
    return this.slotRepository.buscarPorMentor(id);
  }

  buscarDisponiveisPorMentor(id: number): Slot[] | undefined {
    const slots = this.slotRepository.buscarDisponiveisPorMentor(id);
    return slots?.filter((slot) => slot.dataHora > new Date());
  }

  buscarPorDisciplina(id: number): Slot[] | undefined {
    return this.slotRepository.buscarPorDisciplina(id);
  }

  buscarDisponiveisPorDisciplina(id: number): Slot[] | undefined {
    const slots = this.slotRepository.buscarDisponiveisPorDisciplina(id);
    return slots?.filter((slot) => slot.dataHora > new Date());
  }

  atualizarStatus(
    id: number,
    status: "disponivel" | "indisponivel",
  ): Slot | undefined {
    return this.slotRepository.atualizarStatus(id, status);
  }

  atualizar(slot: Slot): Slot | undefined {
    return this.slotRepository.atualizar(slot);
  }

  deletar(id: number): boolean {
    return this.slotRepository.deletar(id);
  }
}
