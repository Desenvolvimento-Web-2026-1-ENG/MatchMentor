import type { Sessao } from "../../entities/Sessao.js";
import type { ISessaoRepository } from "../../repositories/ISessaoRepository.js";

export class SessaoRepositoryInMemory implements ISessaoRepository {
  private sessoes: Sessao[] = [];

  async criar(solicitacao: Sessao): Promise<Sessao> {
    const novoId =
      this.sessoes.length > 0
        ? Math.max(...this.sessoes.map((sessao) => sessao.id)) + 1
        : 1;
    solicitacao.id = novoId;
    this.sessoes.push(solicitacao);
    return solicitacao;
  }

  async buscarPorId(id: number): Promise<Sessao | undefined> {
    return this.sessoes.find((sessao) => sessao.id === id);
  }

  async buscarPorMentorado(id: number): Promise<Sessao[] | undefined> {
    return this.sessoes.filter((sessao) => sessao.mentoradoId === id);
  }

  async buscarAgendadasPorMentorado(id: number): Promise<Sessao[] | undefined> {
    return this.sessoes.filter(
      (sessao) => sessao.mentoradoId === id && sessao.status === "agendada",
    );
  }

  async buscarConcluidasPorMentorado(id: number): Promise<Sessao[] | undefined> {
    return this.sessoes.filter(
      (sessao) => sessao.mentoradoId === id && sessao.status === "concluida",
    );
  }

  async buscarPorMentor(id: number): Promise<Sessao[] | undefined> {
    return this.sessoes.filter((sessao) => sessao.mentorId === id);
  }

  async buscarAgendadasPorMentor(id: number): Promise<Sessao[] | undefined> {
    return this.sessoes.filter(
      (sessao) => sessao.mentorId === id && sessao.status === "agendada",
    );
  }

  async buscarConcluidasPorMentor(id: number): Promise<Sessao[] | undefined> {
    return this.sessoes.filter(
      (sessao) => sessao.mentorId === id && sessao.status === "concluida",
    );
  }

  async atualizarStatus(
    id: number,
    status: "agendada" | "concluida" | "cancelada",
  ): Promise<Sessao | undefined> {
    const sessao = await this.buscarPorId(id);
    if (sessao) {
      sessao.status = status;
      return sessao;
    }
    return undefined;
  }

  async atualizar(sessao: Sessao): Promise<Sessao | undefined> {
    const index = this.sessoes.findIndex((s) => s.id === sessao.id);
    if (index !== -1) {
      this.sessoes[index] = sessao;
      return sessao;
    }
    return undefined;
  }

  async deletar(id: number): Promise<boolean> {
    const index = this.sessoes.findIndex((sessao) => sessao.id === id);
    if (index !== -1) {
      this.sessoes.splice(index, 1);
      return true;
    }
    return false;
  }
}
