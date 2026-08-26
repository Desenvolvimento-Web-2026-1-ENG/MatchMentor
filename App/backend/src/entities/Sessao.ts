import type { SolicitacaoBase } from "./SolicitacaoBase.js";

export interface Sessao extends SolicitacaoBase {
  linkReuniao: string;
  feedbackMentorado?: string;
  status: "agendada" | "concluida" | "cancelada";
}