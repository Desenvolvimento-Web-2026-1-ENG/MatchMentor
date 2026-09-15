import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { ISolicitacaoRepository } from "../repositories/ISolicitacaoRepository.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { IDisciplinaRepository } from "../repositories/IDisciplinaRepository.js";
import type { CriarSolicitacaoDTO } from "./dtos/SolicitacaoDTO.js";
import type { Slot } from "../entities/Slot.js";
import type { Solicitacao } from "../entities/Solicitacao.js";

const SLOT_DURATION_MINUTES = 15;

export class SolicitacaoService {
  constructor(
    private slotRepository: ISlotRepository,
    private solicitacaoRepository: ISolicitacaoRepository,
    private usuarioRepository: IUsuarioRepository,
    private disciplinaRepository: IDisciplinaRepository,
  ) {}

  async criarSolicitacao(solicitacao: CriarSolicitacaoDTO) {
    const solicitacoesDoMentorado = await this.solicitacaoRepository.buscarPorAluno(
      solicitacao.mentoradoId,
    );
    const jaPossuiPendente = solicitacoesDoMentorado?.some(
      (solicitacaoExistente) =>
        solicitacaoExistente.status === "pendente" &&
        solicitacaoExistente.mentorId === solicitacao.mentorId &&
        solicitacaoExistente.dataHora.getTime() === solicitacao.dataHora.getTime(),
    );
    if (jaPossuiPendente) {
      throw new Error("Você já possui uma solicitação pendente para este horário.");
    }

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
    return solicitacoes
      ? await Promise.all(
          solicitacoes.map((solicitacao) => this.mapSolicitacaoToDTO(solicitacao)),
        )
      : [];
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
          throw new Error("Este horário já possui uma sessão confirmada.");
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

        // Recusa automaticamente as demais solicitações pendentes do mesmo horário
        const pendentesDoMentor =
          await this.solicitacaoRepository.buscarPendentesPorMentor(
            solicitacaoAtualizada.mentorId,
          );
        const pendentesMesmoHorario = (pendentesDoMentor ?? []).filter(
          (pendente) =>
            pendente.id !== solicitacaoAtualizada.id &&
            pendente.dataHora.getTime() === solicitacaoAtualizada.dataHora.getTime(),
        );
        for (const pendente of pendentesMesmoHorario) {
          await this.solicitacaoRepository.atualizarStatus(pendente.id, "recusada");
        }
      }
    }
    return this.mapSolicitacaoToDTO(solicitacaoAtualizada);
  }  

  async mapSolicitacaoToDTO(solicitacao: Solicitacao): Promise<CriarSolicitacaoDTO> {
    const mentorado = await this.usuarioRepository.buscarPorId(solicitacao.mentoradoId);
    const disciplina = await this.disciplinaRepository.buscarPorId(
      solicitacao.disciplinaId,
    );

    return {
      solicitacaoId: solicitacao.id,
      mentorId: solicitacao.mentorId,
      mentoradoId: solicitacao.mentoradoId,
      duracaoMinutos: solicitacao.duracaoMinutos,
      disciplinaId: solicitacao.disciplinaId,
      dataHora: solicitacao.dataHora,
      status: solicitacao.status,
      slots: solicitacao.slots,
      mentoradoNome: mentorado?.nome ?? "",
      disciplinaNome: disciplina?.nome ?? "",
    };
  }
}
