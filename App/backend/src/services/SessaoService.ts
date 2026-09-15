import type { ISessaoRepository } from "../repositories/ISessaoRepository.js";
import type { ISolicitacaoRepository } from "../repositories/ISolicitacaoRepository.js";
import type { IUsuarioRepository } from "../repositories/IUsuarioRepository.js";
import type { IDisciplinaRepository } from "../repositories/IDisciplinaRepository.js";
import type { Sessao } from "../entities/Sessao.js";
import type { BasicSessaoDTO, DetalhesSessaoDTO } from "./dtos/SessaoDTO.js";
import type { CriarSolicitacaoDTO } from "./dtos/SolicitacaoDTO.js";
import type { ISlotRepository } from "../repositories/ISlotRepository.js";

export class SessaoService {
  constructor(
    private sessaoRepository: ISessaoRepository,
    private slotRepository: ISlotRepository,
    private solicitacaoRepository: ISolicitacaoRepository,
    private usuarioRepository: IUsuarioRepository,
    private disciplinaRepository: IDisciplinaRepository,
  ) {}

  async adicionarFeedback(sessaoId: number, feedback: string): Promise<DetalhesSessaoDTO> {
    const sessao = await this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    if (sessao.status !== "concluida") {
      throw new Error("Feedback só pode ser adicionado a sessões concluídas.");
    }

    sessao.feedbackMentorado = feedback;
    const sessaoAtualizada = await this.sessaoRepository.atualizar(sessao);
    if (!sessaoAtualizada) {
      throw new Error("Erro ao adicionar feedback à sessão.");
    }

    return this.mapSessaoToDetalhesSessaoDTO(sessaoAtualizada);
  }

  async alterarLinkReuniao(sessaoId: number, linkReuniao: string): Promise<DetalhesSessaoDTO> {
    const sessao = await this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }

    sessao.linkReuniao = linkReuniao;
    const sessaoAtualizada = await this.sessaoRepository.atualizar(sessao);
    if (!sessaoAtualizada) {
      throw new Error("Erro ao atualizar o link da reunião.");
    }

    return this.mapSessaoToDetalhesSessaoDTO(sessaoAtualizada);
  }

  async buscarSessaoPorId(sessaoId: number): Promise<DetalhesSessaoDTO> {
    const sessao = await this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    return this.mapSessaoToDetalhesSessaoDTO(sessao);
  }

  async buscarSessoesPorMentor(mentorId: number): Promise<BasicSessaoDTO[]> {
    const sessoes = await this.sessaoRepository.buscarPorMentor(mentorId);
    if (!sessoes) {
      throw new Error("Nenhuma sessão encontrada para o mentor.");
    }
    return Promise.all(
      sessoes.map((sessao) => this.mapSessaoToBasicSessaoDTO(sessao)),
    );
  }

  async buscarSessoesPorMentorado(mentoradoId: number): Promise<BasicSessaoDTO[]> {
    const sessoes = await this.sessaoRepository.buscarPorMentorado(mentoradoId);
    if (!sessoes) {
      throw new Error("Nenhuma sessão encontrada para o mentorado.");
    }
    return Promise.all(
      sessoes.map((sessao) => this.mapSessaoToBasicSessaoDTO(sessao)),
    );
  }

  async atualizarStatusSessao(sessaoId: number, status: "concluida" | "cancelada"): Promise<BasicSessaoDTO> {
    const sessao = await this.sessaoRepository.buscarPorId(sessaoId);
    if (!sessao) {
      throw new Error("Sessão não encontrada.");
    }
    if (sessao.status === status) {
      throw new Error("A sessão já está com o status desejado.");
    }

    if (sessao.status === "cancelada") {
      throw new Error("Não é possível alterar o status de uma sessão cancelada.");
    }

    if (status === "concluida") {
      const fimDaSessao = new Date(
        sessao.dataHora.getTime() + sessao.duracaoMinutos * 60_000,
      );
      if (fimDaSessao.getTime() > Date.now()) {
        throw new Error(
          "Só é possível concluir a sessão após o horário de término.",
        );
      }
    }
    
    const sessaoAtualizada = await this.sessaoRepository.atualizarStatus(sessaoId, status);
    if (!sessaoAtualizada) {
      throw new Error("Erro ao atualizar o status da sessão.");
    }else{
      if (status === "cancelada") {
        for (const slotId of sessao.slots) {
          const slot = await this.slotRepository.buscarPorId(slotId);
          if (slot) {
            await this.slotRepository.atualizar({
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

  async criarSessao(solicitacaoDTO: CriarSolicitacaoDTO) {
    if (solicitacaoDTO.status !== "aceita") {
      throw new Error("A solicitação deve ser aceita antes de criar a sessão.");
    }

    if(solicitacaoDTO.solicitacaoId === undefined) {
      throw new Error("O ID da solicitação é obrigatório para criar uma sessão.");
    }
    const solicitacao = await this.solicitacaoRepository.buscarPorId(solicitacaoDTO.solicitacaoId);
    
    if (!solicitacao) {
      throw new Error("Solicitação não encontrada.");
    }

    const sessao = await this.sessaoRepository.criar({
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

  private async mapSessaoToDetalhesSessaoDTO(sessao: Sessao): Promise<DetalhesSessaoDTO> {
    const mentor = await this.usuarioRepository.buscarPorId(sessao.mentorId);
    const mentorado = await this.usuarioRepository.buscarPorId(sessao.mentoradoId);
    const disciplina = await this.disciplinaRepository.buscarPorId(
      sessao.disciplinaId,
    );

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
      mentorNome: mentor?.nome ?? "",
      mentoradoNome: mentorado?.nome ?? "",
      disciplinaNome: disciplina?.nome ?? "",
    };
  }

  private async mapSessaoToBasicSessaoDTO(sessao: Sessao): Promise<BasicSessaoDTO> {
    const mentor = await this.usuarioRepository.buscarPorId(sessao.mentorId);
    const mentorado = await this.usuarioRepository.buscarPorId(sessao.mentoradoId);
    const disciplina = await this.disciplinaRepository.buscarPorId(
      sessao.disciplinaId,
    );

    return {
      id: sessao.id,
      mentorId: sessao.mentorId,
      mentoradoId: sessao.mentoradoId,
      disciplinaId: sessao.disciplinaId,
      dataHora: sessao.dataHora,
      duracaoMinutos: sessao.duracaoMinutos,
      status: sessao.status,
      mentorNome: mentor?.nome ?? "",
      mentoradoNome: mentorado?.nome ?? "",
      disciplinaNome: disciplina?.nome ?? "",
      slotIds: sessao.slots,
    };
  }
}
