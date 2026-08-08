import type { Slot } from "./Slot.js";
import type { SlotBase } from "./SlotBase.js";

export interface SolicitacaoBase extends SlotBase {
  mentoradoId: number;
  slots: Slot[];
}