import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { ISolicitacaoRepository } from "../repositories/ISolicitacaoRepository.js";
import type { CriarSolicitacaoDTO } from "./dtos/SolicitacaoDTO.js";
import type { Slot } from "../entities/Slot.js";
import type { Solicitacao } from "../entities/Solicitacao.js";

const SLOT_DURATION_MINUTES = 15;

export class SolicitacaoService {
  constructor(
    private slotRepository: ISlotRepository,
    private solicitacaoRepository: ISolicitacaoRepository,
  ) {}

  async criarSolicitacao(solicitacao: CriarSolicitacaoDTO) {
    const slotsDisponiveis = await this.slotRepository.buscarDisponiveisPorMentor(
      solicitacao.mentorId,
    );
    if (!slotsDisponiveis) {
      throw new Error("Nenhum slot disponível para o mentor especificado.");
    }

    const slotsNecessarios = Math.ceil(
      solicitacao.duracaoMinutos / SLOT_DURATION_MINUTES,
    );
    const slotsPorHora = new Map<number, Slot>(
      slotsDisponiveis.map((slot) => [slot.dataHora.getTime(), slot]),
    );

    const slotsSelecionados: Slot[] = [];
    for (let i = 0; i < slotsNecessarios; i++) {
      const horaEsperada = new Date(
        solicitacao.dataHora.getTime() + i * SLOT_DURATION_MINUTES * 60_000,
      );
      const slot = slotsPorHora.get(horaEsperada.getTime());
      if (!slot) {
        throw new Error(
          "Não há slots suficientes disponíveis para a duração solicitada.",
        );
      }
      slotsSelecionados.push(slot);
    }

    return this.solicitacaoRepository.criar({
      id: 0, // O ID será gerado pelo repositório
      mentorId: solicitacao.mentorId,
      mentoradoId: solicitacao.mentoradoId,
      duracaoMinutos: solicitacao.duracaoMinutos,
      disciplinaId: solicitacao.disciplinaId,
      dataHora: solicitacao.dataHora,
      status: "pendente",
      slots: slotsSelecionados.map((slot) => slot.id),
    });
  }

  async listarSolicitacoesPendentes(mentorId: number): Promise<CriarSolicitacaoDTO[]> {
    const solicitacoes =
      await this.solicitacaoRepository.buscarPendentesPorMentor(mentorId);
    return solicitacoes ? solicitacoes.map(this.mapSolicitacaoToDTO) : [];
  }

  async atualizarSolicitacao(
    solicitacaoId: number,
    status: "aceita" | "recusada",
  ): Promise<CriarSolicitacaoDTO | undefined> {
    const solicitacao = await this.solicitacaoRepository.buscarPorId(solicitacaoId);
    if (!solicitacao) {
      throw new Error("Solicitação não encontrada.");
    }

    if (solicitacao.status !== "pendente") {
      throw new Error("Solicitação já foi processada.");
    }

    if (status === "aceita") {
      for (const slotId of solicitacao.slots) {
        const slot = await this.slotRepository.buscarPorId(slotId);
        if (!slot || slot.status !== "disponivel") {
          throw new Error("Um ou mais slots da solicitação não estão disponíveis.");
        }
      }
    }

    const solicitacaoAtualizada = await this.solicitacaoRepository.atualizarStatus(
      solicitacaoId,
      status,
    );
    
    if (!solicitacaoAtualizada) {
      throw new Error("Erro ao atualizar o status da solicitação.");
    }else{
      if (status === "aceita") {
        for (const slotId of solicitacaoAtualizada.slots) {
          const slot = await this.slotRepository.buscarPorId(slotId);
          if (slot) {
            await this.slotRepository.atualizar({
              ...slot,
              status: "indisponivel",
              disciplinaId: solicitacao.disciplinaId,
            });
          }
        }
      }
    }
    return this.mapSolicitacaoToDTO(solicitacaoAtualizada);
  }  

  mapSolicitacaoToDTO(solicitacao: Solicitacao): CriarSolicitacaoDTO {
    return {
      solicitacaoId: solicitacao.id,
      mentorId: solicitacao.mentorId,
      mentoradoId: solicitacao.mentoradoId,
      duracaoMinutos: solicitacao.duracaoMinutos,
      disciplinaId: solicitacao.disciplinaId,
      dataHora: solicitacao.dataHora,
      status: solicitacao.status,
    };
  }
}
