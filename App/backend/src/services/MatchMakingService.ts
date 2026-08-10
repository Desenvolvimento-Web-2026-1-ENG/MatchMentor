import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { ISolicitacaoRepository } from "../repositories/ISolicitacaoRepository.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { ISessaoRepository } from "../repositories/ISessaoRepository.js";
import type { CriarSolicitacaoDTO } from "./dtos/SolicitacaoDTO.js";
import type { Slot } from "../entities/Slot.js";
import type { Solicitacao } from "../entities/Solicitacao.js";

export class MatchMakingService {
  constructor(
    private slotRepository: ISlotRepository,
    private usuarioRepository: IUsuarioRepository,
    private solicitacaoRepository: ISolicitacaoRepository,
    private sessaoRepository: ISessaoRepository,
  ) {}

  buscarMentoresPorDisciplina(disciplinaId: number) {
    const slots =
      this.slotRepository.buscarDisponiveisPorDisciplina(disciplinaId);
    if (!slots) {
      return [];
    }
    const mentorIds = new Set(slots.map((slot) => slot.mentorId));
    const mentores = Array.from(mentorIds)
      .map((id) => this.usuarioRepository.buscarPorId(id))
      .filter(Boolean);
    return mentores;
  }

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

  procesarSolicitacao(
    solicitacaoId: number,
    status: "aceita" | "recusada",
  ): boolean {
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

    // Bloquear os slots correspondentes à duração da sessão
    for (const slot of solicitacao.slots) {
      this.slotRepository.atualizarStatus(slot.id, "indisponivel");
    }

    return sessao;
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
