import type { SlotBase } from "./SlotBase.js";

export interface SolicitacaoBase extends SlotBase {
  mentoradoId: number;
  slots: number[];
}