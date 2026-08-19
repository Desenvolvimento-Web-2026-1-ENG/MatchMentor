import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { ISolicitacaoRepository } from "../repositories/ISolicitacaoRepository.js";
import type { CriarSolicitacaoDTO } from "./dtos/SolicitacaoDTO.js";
import type { Slot } from "../entities/Slot.js";
import type { Solicitacao } from "../entities/Solicitacao.js";
import type { Sessao } from "../entities/Sessao.js";

export class SolicitacaoService {
  constructor(
    private slotRepository: ISlotRepository,
    private solicitacaoRepository: ISolicitacaoRepository,
  ) {}

  criarSolicitacao(solicitacao: CriarSolicitacaoDTO) {
    const slotsDisponiveis = this.slotRepository.buscarDisponiveisPorMentor(
      solicitacao.mentorId,
    );
    if (!slotsDisponiveis) {
      throw new Error("Nenhum slot disponível para o mentor especificado.");
    }

    const slotsNecessarios = Math.ceil(solicitacao.duracaoMinutos / 30);
    const slotsSelecionados: Slot[] = [];

    slotsDisponiveis.sort(
      (a, b) => a.dataHora.getTime() - b.dataHora.getTime(),
    );
    for (const slot of slotsDisponiveis) {
      if (
        slot.dataHora >= solicitacao.dataHora &&
        slotsSelecionados.length < slotsNecessarios
      ) {
        slotsSelecionados.push(slot);
      }
    }

    if (slotsSelecionados.length < slotsNecessarios) {
      throw new Error(
        "Não há slots suficientes disponíveis para a duração solicitada.",
      );
    }

    return this.solicitacaoRepository.criar({
      id: 0, // O ID será gerado pelo repositório
      mentorId: solicitacao.mentorId,
      mentoradoId: solicitacao.mentoradoId,
      duracaoMinutos: solicitacao.duracaoMinutos,
      disciplinaId: solicitacao.disciplinaId,
      dataHora: solicitacao.dataHora,
      status: "pendente",
      slots: slotsSelecionados,
    });
  }

  listarSolicitacoesPendentes(mentorId: number): CriarSolicitacaoDTO[] {
    const solicitacoes =
      this.solicitacaoRepository.buscarPendentesPorMentor(mentorId);
    return solicitacoes ? solicitacoes.map(this.mapSolicitacaoToDTO) : [];
  }

  atualizarSolicitacao(
    solicitacaoId: number,
    status: "aceita" | "recusada",
  ): Solicitacao | undefined {
    const solicitacao = this.solicitacaoRepository.buscarPorId(solicitacaoId);
    if (!solicitacao) {
      throw new Error("Solicitação não encontrada.");
    }
    if (solicitacao.status !== "pendente") {
      throw new Error("Solicitação já foi processada.");
    }

    const solicitacaoAtualizada = this.solicitacaoRepository.atualizarStatus(
      solicitacaoId,
      status,
    );
    
    if (!solicitacaoAtualizada) {
      throw new Error("Erro ao atualizar o status da solicitação.");
    }

    return solicitacaoAtualizada;
  }  

  mapSolicitacaoToDTO(solicitacao: Solicitacao): CriarSolicitacaoDTO {
    return {
      mentorId: solicitacao.mentorId,
      mentoradoId: solicitacao.mentoradoId,
      duracaoMinutos: solicitacao.duracaoMinutos,
      disciplinaId: solicitacao.disciplinaId,
      dataHora: solicitacao.dataHora,
    };
  }
}
