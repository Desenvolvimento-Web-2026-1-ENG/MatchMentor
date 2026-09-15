import type { Sessao } from "../entities/Sessao.js";

export interface ISessaoRepository {
  criar(solicitacao: Sessao): Promise<Sessao>;
  buscarPorId(id: number): Promise<Sessao | undefined>;
  buscarPorMentorado(id: number): Promise<Sessao[] | undefined>;
  buscarAgendadasPorMentorado(id: number): Promise<Sessao[] | undefined>;
  buscarConcluidasPorMentorado(id: number): Promise<Sessao[] | undefined>;
  buscarPorMentor(id: number): Promise<Sessao[] | undefined>;
  buscarAgendadasPorMentor(id: number): Promise<Sessao[] | undefined>;
  buscarConcluidasPorMentor(id: number): Promise<Sessao[] | undefined>;
  atualizarStatus(id: number, status: "agendada" | "concluida" | "cancelada"): Promise<Sessao | undefined>;
  atualizar(sessao: Sessao): Promise<Sessao | undefined>;
  deletar(id: number): Promise<boolean>;
}