import type { Sessao } from "../../entities/Sessao.js";
import type { ISessaoRepository } from "../../repositories/ISessaoRepository.js";

export class SessaoRepositoryInMemory implements ISessaoRepository {
  private sessoes: Sessao[] = [];

  criar(solicitacao: Sessao): Sessao {
    const novoId =
      this.sessoes.length > 0
        ? Math.max(...this.sessoes.map((sessao) => sessao.id)) + 1
        : 1;
    solicitacao.id = novoId;
    this.sessoes.push(solicitacao);
    return solicitacao;
  }

  buscarPorId(id: number): Sessao | undefined {
    return this.sessoes.find((sessao) => sessao.id === id);
  }

  buscarPorMentorado(id: number): Sessao[] | undefined {
    return this.sessoes.filter((sessao) => sessao.mentoradoId === id);
  }

  buscarAgendadasPorMentorado(id: number): Sessao[] | undefined {
    return this.sessoes.filter(
      (sessao) => sessao.mentoradoId === id && sessao.status === "agendada",
    );
  }

  buscarConcluidasPorMentorado(id: number): Sessao[] | undefined {
    return this.sessoes.filter(
      (sessao) => sessao.mentoradoId === id && sessao.status === "concluida",
    );
  }

  buscarPorMentor(id: number): Sessao[] | undefined {
    return this.sessoes.filter((sessao) => sessao.mentorId === id);
  }

  buscarAgendadasPorMentor(id: number): Sessao[] | undefined {
    return this.sessoes.filter(
      (sessao) => sessao.mentorId === id && sessao.status === "agendada",
    );
  }

  buscarConcluidasPorMentor(id: number): Sessao[] | undefined {
    return this.sessoes.filter(
      (sessao) => sessao.mentorId === id && sessao.status === "concluida",
    );
  }

  atualizarStatus(
    id: number,
    status: "agendada" | "concluida" | "cancelada",
  ): Sessao | undefined {
    const sessao = this.buscarPorId(id);
    if (sessao) {
      sessao.status = status;
      return sessao;
    }
    return undefined;
  }

  deletar(id: number): boolean {
    const index = this.sessoes.findIndex((sessao) => sessao.id === id);
    if (index !== -1) {
      this.sessoes.splice(index, 1);
      return true;
    }
    return false;
  }
}
