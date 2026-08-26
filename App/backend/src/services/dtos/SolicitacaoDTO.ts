export interface CriarSolicitacaoDTO {
  solicitacaoId?: number;
  mentorId: number;
  mentoradoId: number;
  duracaoMinutos: number;
  disciplinaId: number;  
  dataHora: Date;
  status?: "pendente" | "aceita" | "recusada";
}