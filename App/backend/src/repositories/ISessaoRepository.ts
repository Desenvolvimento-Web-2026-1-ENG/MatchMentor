import type { Sessao } from "../entities/Sessao.js";

export interface ISessaoRepository {
  criar(solicitacao: Sessao): Sessao;
  buscarPorId(id: number): Sessao | undefined;
  buscarPorMentorado(id: number): Sessao[] | undefined;
  buscarAgendadasPorMentorado(id: number): Sessao[] | undefined;
  buscarConcluidasPorMentorado(id: number): Sessao[] | undefined;
  buscarPorMentor(id: number): Sessao[] | undefined;
  buscarAgendadasPorMentor(id: number): Sessao[] | undefined;
  buscarConcluidasPorMentor(id: number): Sessao[] | undefined;
  atualizarStatus(id: number, status: "agendada" | "concluida" | "cancelada"): Sessao | undefined;
  deletar(id: number): boolean;
}