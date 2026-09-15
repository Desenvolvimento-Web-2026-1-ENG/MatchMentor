import type { IDisciplinaRepository } from "../../repositories/IDisciplinaRepository.js";
import type { Disciplina } from "../../entities/Disciplina.js";

export class DisciplinaRepositoryInMemory implements IDisciplinaRepository {
  private disciplinas: Disciplina[] = [];

  async buscarPorId(id: number): Promise<Disciplina | undefined> {
    return this.disciplinas.find((disciplina) => disciplina.id === id);
  }

  async buscarTodos(): Promise<Disciplina[]> {
    return this.disciplinas;
  }

  async criar(disciplina: Disciplina): Promise<Disciplina> {
    const novoId =
      this.disciplinas.length > 0
        ? Math.max(...this.disciplinas.map((d) => d.id)) + 1
        : 1;
    disciplina.id = novoId;
    this.disciplinas.push(disciplina);
    return disciplina;
  }

  async atualizar(disciplina: Disciplina): Promise<Disciplina | undefined> {
    const index = this.disciplinas.findIndex((d) => d.id === disciplina.id);
    if (index !== -1) {
      this.disciplinas[index] = disciplina;
      return disciplina;
    }
    return undefined;
  }

  async deletar(id: number): Promise<boolean> {
    const index = this.disciplinas.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.disciplinas.splice(index, 1);
      return true;
    }
    return false;
  }
}
