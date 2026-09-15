import type { Slot } from "../entities/Slot.js";

export interface ISlotRepository {
  criar(slot: Slot): Promise<Slot>;
  buscarPorId(id: number): Promise<Slot | undefined>;
  buscarPorMentor(id: number): Promise<Slot[] | undefined>;
  buscarDisponiveisPorMentor(id: number): Promise<Slot[] | undefined>;
  buscarPorDisciplina(id: number): Promise<Slot[] | undefined>;
  atualizarStatus(id: number, status: "disponivel" | "indisponivel"): Promise<Slot | undefined>;
  atualizar(slot: Slot): Promise<Slot | undefined>;
  deletar(id: number): Promise<boolean>;
}