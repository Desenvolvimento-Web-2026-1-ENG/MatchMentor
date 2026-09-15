import type { Disciplina } from "../entities/Disciplina.js";

export interface IDisciplinaRepository {
  buscarPorId(id: number): Promise<Disciplina | undefined>;
  buscarTodos(): Promise<Disciplina[]>;
  criar(disciplina: Disciplina): Promise<Disciplina>;
  atualizar(disciplina: Disciplina): Promise<Disciplina | undefined>;
  deletar(id: number): Promise<boolean>;
}