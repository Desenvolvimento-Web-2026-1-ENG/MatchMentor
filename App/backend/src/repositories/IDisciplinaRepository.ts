import type { Disciplina } from "../entities/Disciplina.js";

export interface IDisciplinaRepository {
  buscarPorId(id: number): Disciplina | undefined;
  buscarTodos(): Disciplina[];
  criar(disciplina: Disciplina): Disciplina;
  atualizar(disciplina: Disciplina): Disciplina | undefined;
  deletar(id: number): boolean;
}