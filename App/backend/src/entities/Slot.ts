import type { SlotBase } from "./SlotBase.js";

export interface Slot extends SlotBase {
  status: "disponivel" | "indisponivel";
}