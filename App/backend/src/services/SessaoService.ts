import type { ISessaoRepository } from "../repositories/ISessaoRepository.js";
import type { Sessao } from "../entities/Sessao.js";
import type { BasicSessaoDTO, DetalhesSessaoDTO } from "./dtos/SessaoDTO.js";
import type { Solicitacao } from "../entities/Solicitacao.js";
import type { ISlotRepository } from "../repositories/ISlotRepository.js";

export class SessaoService {
  constructor(private sessaoRepository: ISessaoRepository, private slotRepository: ISlotRepository) {}

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

    for (const slot of sessao.slots) {
      this.slotRepository.atualizar({
        ...slot,
        disciplinaId: 0,
        status: "disponivel",
      });
    }

    return true;
  }

  criarSessao(solicitacao: Solicitacao) {
    if (solicitacao.status !== "aceita") {
      throw new Error("A solicitação deve ser aceita antes de criar a sessão.");
    }

    const sessao = this.sessaoRepository.criar({
      id: 0, // O ID será gerado pelo repositório
      mentorId: solicitacao.mentorId,
      mentoradoId: solicitacao.mentoradoId,
      duracaoMinutos: solicitacao.duracaoMinutos,
      disciplinaId: solicitacao.disciplinaId,
      dataHora: solicitacao.dataHora,
      status: "agendada",
      linkReuniao: "", // O link da reunião será gerado posteriormente
      slots: solicitacao.slots,
    });

    for (const slot of solicitacao.slots) {
      this.slotRepository.atualizar({
        ...slot,
        disciplinaId: solicitacao.disciplinaId,
        status: "indisponivel",
      });
    }

    return sessao;
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
