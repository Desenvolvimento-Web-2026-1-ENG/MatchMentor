export interface CriarSlotDTO {
    mentorId: number;
    dataHora: Date;
    duracaoTotalMinutos: number;
}

export interface AtualizarSlotDTO {
    id: number;
    status: "disponivel" | "indisponivel";
}