import type { Solicitacao } from "../entities/Solicitacao.js";

export interface ISolicitacaoRepository {
  criar(solicitacao: Solicitacao): Solicitacao;
  buscarPorId(id: number): Solicitacao | undefined;
  buscarPorAluno(id: number): Solicitacao[] | undefined;
  buscarPorMentor(id: number): Solicitacao[] | undefined;
  buscarPendentesPorMentor(id: number): Solicitacao[] | undefined;
  atualizarStatus(id: number, status: "pendente" | "aceita" | "recusada"): Solicitacao | undefined;
  deletar(id: number): boolean;
}