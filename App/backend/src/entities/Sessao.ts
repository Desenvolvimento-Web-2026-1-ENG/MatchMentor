export interface Sessao {
  id: number;
  mentorId: number;
  mentoradoId: number;
  dataHora: Date;
  duracaoMinutos: number;
  status: "agendada" | "concluida" | "cancelada";
}