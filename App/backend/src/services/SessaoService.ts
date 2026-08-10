import type { ISessaoRepository } from "../repositories/ISessaoRepository.js";
import type { Sessao } from "../entities/Sessao.js";
import type { BasicSessaoDTO, DetalhesSessaoDTO } from "./dtos/SessaoDTO.js";

export class SessaoService {
  constructor(private sessaoRepository: ISessaoRepository) {}

  adicionarFeedback(sessaoId: number, feedback: string): DetalhesSessaoDTO {
    const sessao = this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    if (sessao.status !== "concluida") {
      throw new Error("Feedback só pode ser adicionado a sessões concluídas.");
    }

    sessao.feedbackMentorado = feedback;
    const sessaoAtualizada = this.sessaoRepository.atualizarStatus(sessaoId, sessao.status);
    if (!sessaoAtualizada) {
      throw new Error("Erro ao adicionar feedback à sessão.");
    }

    return this.mapSessaoToDetalhesSessaoDTO(sessaoAtualizada);
  }

  alterarLinkReuniao(sessaoId: number, linkReuniao: string): DetalhesSessaoDTO {
    const sessao = this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }

    sessao.linkReuniao = linkReuniao;
    const sessaoAtualizada = this.sessaoRepository.atualizarStatus(
      sessaoId,
      sessao.status,
    );
    if (!sessaoAtualizada) {
      throw new Error("Erro ao atualizar o link da reunião.");
    }

    return this.mapSessaoToDetalhesSessaoDTO(sessaoAtualizada);
  }

  buscarSessaoPorId(sessaoId: number): DetalhesSessaoDTO {
    const sessao = this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    return this.mapSessaoToDetalhesSessaoDTO(sessao);
  }

  buscarSessoesPorMentor(mentorId: number): BasicSessaoDTO[] {
    const sessoes = this.sessaoRepository.buscarPorMentor(mentorId);
    if (!sessoes) {
      throw new Error("Nenhuma sessão encontrada para o mentor.");
    }
    return sessoes.map(this.mapSessaoToBasicSessaoDTO);
  }

  buscarSessoesPorMentorado(mentoradoId: number): BasicSessaoDTO[] {
    const sessoes = this.sessaoRepository.buscarPorMentorado(mentoradoId);
    if (!sessoes) {
      throw new Error("Nenhuma sessão encontrada para o mentorado.");
    }
    return sessoes.map(this.mapSessaoToBasicSessaoDTO);
  }

  marcarSessaoComoRealizada(sessaoId: number): boolean {
    const sessao = this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    if (sessao.status !== "agendada") {
      throw new Error(
        "A sessão deve estar agendada para ser marcada como realizada.",
      );
    }

    const sessaoAtualizada = this.sessaoRepository.atualizarStatus(
      sessaoId,
      "concluida",
    );
    if (!sessaoAtualizada) {
      throw new Error("Erro ao marcar a sessão como realizada.");
    }

    return true;
  }

  cancelarSessao(sessaoId: number): boolean {
    const sessao = this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    if (sessao.status !== "agendada") {
      throw new Error("A sessão deve estar agendada para ser cancelada.");
    }

    const sessaoAtualizada = this.sessaoRepository.atualizarStatus(
      sessaoId,
      "cancelada",
    );
    if (!sessaoAtualizada) {
      throw new Error("Erro ao cancelar a sessão.");
    }

    return true;
  }

  private mapSessaoToDetalhesSessaoDTO(sessao: Sessao): DetalhesSessaoDTO {
    return {
      id: sessao.id,
      mentorId: sessao.mentorId,
      mentoradoId: sessao.mentoradoId,
      disciplinaId: sessao.disciplinaId,
      dataHora: sessao.dataHora,
      duracaoMinutos: sessao.duracaoMinutos,
      linkReuniao: sessao.linkReuniao,
      feedbackMentorado: sessao.feedbackMentorado,
      status: sessao.status,
    };
  }

  private mapSessaoToBasicSessaoDTO(sessao: Sessao): BasicSessaoDTO {
    return {
      disciplinaId: sessao.disciplinaId,
      dataHora: sessao.dataHora,
      duracaoMinutos: sessao.duracaoMinutos,
      status: sessao.status,
    };
  }
}
