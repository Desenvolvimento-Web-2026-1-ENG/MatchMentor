import type { ISessaoRepository } from "../repositories/ISessaoRepository.js";
import type { ISolicitacaoRepository } from "../repositories/ISolicitacaoRepository.js";
import type { Sessao } from "../entities/Sessao.js";
import type { BasicSessaoDTO, DetalhesSessaoDTO } from "./dtos/SessaoDTO.js";
import type { CriarSolicitacaoDTO } from "./dtos/SolicitacaoDTO.js";
import type { ISlotRepository } from "../repositories/ISlotRepository.js";

export class SessaoService {
  constructor(private sessaoRepository: ISessaoRepository, private slotRepository: ISlotRepository, private solicitacaoRepository: ISolicitacaoRepository) {}

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

  atualizarStatusSessao(sessaoId: number, status: "concluida" | "cancelada"): BasicSessaoDTO {
    const sessao = this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    if (sessao.status === status) {
      throw new Error("A sessão já está com o status desejado.");
    }

    if (sessao.status === "cancelada") {
      throw new Error("Não é possível alterar o status de uma sessão cancelada.");
    }
    
    const sessaoAtualizada = this.sessaoRepository.atualizarStatus(sessaoId, status);
    if (!sessaoAtualizada) {
      throw new Error("Erro ao atualizar o status da sessão.");
    }else{
      if (status === "cancelada") {
        for (const slotId of sessao.slots) {
          const slot = this.slotRepository.buscarPorId(slotId);
          if (slot) {
            this.slotRepository.atualizar({
              ...slot,
              disciplinaId: 0,
              status: "disponivel",
            });
          }
        }
      }
    }

    return this.mapSessaoToBasicSessaoDTO(sessaoAtualizada);
  }

  criarSessao(solicitacaoDTO: CriarSolicitacaoDTO) {
    if (solicitacaoDTO.status !== "aceita") {
      throw new Error("A solicitação deve ser aceita antes de criar a sessão.");
    }

    if(solicitacaoDTO.solicitacaoId === undefined) {
      throw new Error("O ID da solicitação é obrigatório para criar uma sessão.");
    }
    const solicitacao = this.solicitacaoRepository.buscarPorId(solicitacaoDTO.solicitacaoId);
    
    if (!solicitacao) {
      throw new Error("Solicitação não encontrada.");
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
      id: sessao.id,
      disciplinaId: sessao.disciplinaId,
      dataHora: sessao.dataHora,
      duracaoMinutos: sessao.duracaoMinutos,
      status: sessao.status,
    };
  }
}
