import type { ISlotRepository } from "../repositories/ISlotRepository.js";
import type { ISolicitacaoRepository } from "../repositories/ISolicitacaoRepository.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { CriarSolicitacaoDTO } from "./dtos/SolicitacaoDTO.js";
import type { Slot } from "../entities/Slot.js";

export class MatchMakingService {
    constructor(private slotRepository: ISlotRepository, private usuarioRepository: IUsuarioRepository, private solicitacaoRepository: ISolicitacaoRepository) {}

    buscarMentoresPorDisciplina(disciplinaId: number) {
        const slots = this.slotRepository.buscarDisponiveisPorDisciplina(disciplinaId);
        if (!slots) {
            return [];
        }
        const mentorIds = new Set(slots.map(slot => slot.mentorId));
        const mentores = Array.from(mentorIds).map(id => this.usuarioRepository.buscarPorId(id)).filter(Boolean);
        return mentores;
    }

    criarSolicitacao(solicitacao: CriarSolicitacaoDTO) {
        const slotsDisponiveis = this.slotRepository.buscarDisponiveisPorMentor(solicitacao.mentorId);
        if (!slotsDisponiveis) {
            throw new Error("Nenhum slot disponível para o mentor especificado.");
        }

        const slotsNecessarios = Math.ceil(solicitacao.duracaoMinutos / 30);
        const slotsSelecionados: Slot[] = [];

        slotsDisponiveis.sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());
        for (const slot of slotsDisponiveis) {
            if (slot.dataHora >= solicitacao.dataHora && slotsSelecionados.length < slotsNecessarios) {
                slotsSelecionados.push(slot);
            }
        }

        if (slotsSelecionados.length < slotsNecessarios) {
            throw new Error("Não há slots suficientes disponíveis para a duração solicitada.");
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
}