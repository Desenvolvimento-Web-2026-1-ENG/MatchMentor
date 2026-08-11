import type { Solicitacao } from "../../entities/Solicitacao.js";
import type { ISolicitacaoRepository } from "../../repositories/ISolicitacaoRepository.js";

export class SolicitacaoRepositoryInMemory implements ISolicitacaoRepository {
  private solicitacoes: Solicitacao[] = [];

  criar(solicitacao: Solicitacao): Solicitacao {
    const novoId =
      this.solicitacoes.length > 0
        ? Math.max(...this.solicitacoes.map((s) => s.id)) + 1
        : 1;
    solicitacao.id = novoId;
    this.solicitacoes.push(solicitacao);
    return solicitacao;
  }

  buscarPorId(id: number): Solicitacao | undefined {
    return this.solicitacoes.find((solicitacao) => solicitacao.id === id);
  }

  buscarPorAluno(id: number): Solicitacao[] | undefined {
    return this.solicitacoes.filter(
      (solicitacao) => solicitacao.mentoradoId === id,
    );
  }

  buscarPorMentor(id: number): Solicitacao[] | undefined {
    return this.solicitacoes.filter(
      (solicitacao) => solicitacao.mentorId === id,
    );
  }

  buscarPendentesPorMentor(id: number): Solicitacao[] | undefined {
    return this.solicitacoes.filter(
      (solicitacao) =>
        solicitacao.mentorId === id && solicitacao.status === "pendente",
    );
  }

  atualizarStatus(
    id: number,
    status: "pendente" | "aceita" | "recusada",
  ): Solicitacao | undefined {
    const solicitacao = this.solicitacoes.find(
      (solicitacao) => solicitacao.id === id,
    );
    if (solicitacao) {
      solicitacao.status = status;
      return solicitacao;
    }
    return undefined;
  }

  deletar(id: number): boolean {
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
