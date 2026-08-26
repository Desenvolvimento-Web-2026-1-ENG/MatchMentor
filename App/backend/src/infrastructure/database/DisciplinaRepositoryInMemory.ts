import type { IDisciplinaRepository } from "../../repositories/IDisciplinaRepository.js";
import type { Disciplina } from "../../entities/Disciplina.js";

export class DisciplinaRepositoryInMemory implements IDisciplinaRepository {
  private disciplinas: Disciplina[] = [];

  buscarPorId(id: number): Disciplina | undefined {
    return this.disciplinas.find((disciplina) => disciplina.id === id);
  }

  buscarTodos(): Disciplina[] {
    return this.disciplinas;
  }

  criar(disciplina: Disciplina): Disciplina {
    const novoId =
      this.disciplinas.length > 0
        ? Math.max(...this.disciplinas.map((d) => d.id)) + 1
        : 1;
    disciplina.id = novoId;
    this.disciplinas.push(disciplina);
    return disciplina;
  }

  atualizar(disciplina: Disciplina): Disciplina | undefined {
    const index = this.disciplinas.findIndex((d) => d.id === disciplina.id);
    if (index !== -1) {
      this.disciplinas[index] = disciplina;
      return disciplina;
    }
    return undefined;
  }

  deletar(id: number): boolean {
    const index = this.disciplinas.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.disciplinas.splice(index, 1);
      return true;
    }
    return false;
  }
}
