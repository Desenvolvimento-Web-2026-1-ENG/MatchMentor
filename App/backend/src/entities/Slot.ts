export interface Slot {
  id: number;
  mentorId: number;
  disciplinaId: number;
  dataHora: Date;
  duracaoMinutos: number;
  status: "disponivel" | "indisponivel";
}