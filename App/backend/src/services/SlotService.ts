import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { Slot } from "../entities/Slot.js";


export class SlotService {
    constructor(private slotRepository: ISlotRepository) {}

    criar(slot: Slot): Slot {
        return this.slotRepository.criar(slot);
    }

    buscarPorMentor(id: number): Slot[] | undefined {
        return this.slotRepository.buscarPorMentor(id);
    }

    buscarDisponiveisPorMentor(id: number): Slot[] | undefined {
        const slots = this.slotRepository.buscarDisponiveisPorMentor(id);
        return slots?.filter(slot => slot.dataHora > new Date());
    }

    buscarPorDisciplina(id: number): Slot[] | undefined {
        return this.slotRepository.buscarPorDisciplina(id);
    }

    buscarDisponiveisPorDisciplina(id: number): Slot[] | undefined {
        const slots = this.slotRepository.buscarDisponiveisPorDisciplina(id);
        return slots?.filter(slot => slot.dataHora > new Date());
    }

    atualizarStatus(id: number, status: "disponivel" | "indisponivel"): Slot | undefined {
        return this.slotRepository.atualizarStatus(id, status);
    }

    atualizar(slot: Slot): Slot | undefined {
        return this.slotRepository.atualizar(slot);
    }

    deletar(id: number): boolean {
        return this.slotRepository.deletar(id);
    }


}