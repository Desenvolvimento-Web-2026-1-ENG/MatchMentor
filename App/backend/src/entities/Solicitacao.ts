import type { SolicitacaoBase } from "./SolicitacaoBase.js";

export interface Solicitacao extends SolicitacaoBase {
  status: "pendente" | "aceita" | "recusada";
}
