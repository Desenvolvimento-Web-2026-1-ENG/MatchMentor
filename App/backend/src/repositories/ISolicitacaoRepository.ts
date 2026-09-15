import type { Solicitacao } from "../entities/Solicitacao.js";

export interface ISolicitacaoRepository {
  criar(solicitacao: Solicitacao): Promise<Solicitacao>;
  buscarPorId(id: number): Promise<Solicitacao | undefined>;
  buscarPorAluno(id: number): Promise<Solicitacao[] | undefined>;
  buscarPorMentor(id: number): Promise<Solicitacao[] | undefined>;
  buscarPendentesPorMentor(id: number): Promise<Solicitacao[] | undefined>;
  atualizarStatus(id: number, status: "pendente" | "aceita" | "recusada"): Promise<Solicitacao | undefined>;
  deletar(id: number): Promise<boolean>;
}