export interface CriarSlotDTO {
    mentorId: number;
    dataHora: Date;
    duracaoTotalMinutos: number;
}

export interface AtualizarSlotDTO {
    dataHora?: Date;
    status?: "disponivel" | "indisponivel";
}