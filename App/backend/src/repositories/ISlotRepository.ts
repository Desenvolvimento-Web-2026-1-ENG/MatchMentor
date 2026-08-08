import type { Slot } from "../entities/Slot.js";

export interface ISlotRepository {
  criar(slot: Slot): Slot;
  buscarPorMentor(id: number): Slot[] | undefined;
  buscarDisponiveisPorMentor(id: number): Slot[] | undefined;
  buscarPorDisciplina(id: number): Slot[] | undefined;
  buscarDisponiveisPorDisciplina(id: number): Slot[] | undefined;
  atualizarStatus(id: number, status: "disponivel" | "indisponivel"): Slot | undefined;
  atualizar(slot: Slot): Slot | undefined;
  deletar(id: number): boolean;
}