export interface Solicitacao {
  id: number;
  mentorId: number;
  mentoradoId: number;
  disciplinaId: number;
  dataHora: Date;
  duracaoMinutos: number;
  status: "pendente" | "aceita" | "recusada";
}
