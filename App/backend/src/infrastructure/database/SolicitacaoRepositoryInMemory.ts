import type { Solicitacao } from "../../entities/Solicitacao.js";
import type { ISolicitacaoRepository } from "../../repositories/ISolicitacaoRepository.js";

export class SolicitacaoRepositoryInMemory implements ISolicitacaoRepository {
  private solicitacoes: Solicitacao[] = [];

  async criar(solicitacao: Solicitacao): Promise<Solicitacao> {
    const novoId =
      this.solicitacoes.length > 0
        ? Math.max(...this.solicitacoes.map((s) => s.id)) + 1
        : 1;
    solicitacao.id = novoId;
    this.solicitacoes.push(solicitacao);
    return solicitacao;
  }

  async buscarPorId(id: number): Promise<Solicitacao | undefined> {
    return this.solicitacoes.find((solicitacao) => solicitacao.id === id);
  }

  async buscarPorAluno(id: number): Promise<Solicitacao[] | undefined> {
    return this.solicitacoes.filter(
      (solicitacao) => solicitacao.mentoradoId === id,
    );
  }

  async buscarPorMentor(id: number): Promise<Solicitacao[] | undefined> {
    return this.solicitacoes.filter(
      (solicitacao) => solicitacao.mentorId === id,
    );
  }

  async buscarPendentesPorMentor(id: number): Promise<Solicitacao[] | undefined> {
    return this.solicitacoes.filter(
      (solicitacao) =>
        solicitacao.mentorId === id && solicitacao.status === "pendente",
    );
  }

  async atualizarStatus(
    id: number,
    status: "pendente" | "aceita" | "recusada",
  ): Promise<Solicitacao | undefined> {
    const solicitacao = this.solicitacoes.find(
      (solicitacao) => solicitacao.id === id,
    );
    if (solicitacao) {
      solicitacao.status = status;
      return solicitacao;
    }
    return undefined;
  }

  async deletar(id: number): Promise<boolean> {
    const index = this.solicitacoes.findIndex(
      (solicitacao) => solicitacao.id === id,
    );
    if (index !== -1) {
      this.solicitacoes.splice(index, 1);
      return true;
    }
    return false;
  }
}
