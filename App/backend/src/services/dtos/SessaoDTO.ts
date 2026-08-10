export interface DetalhesSessaoDTO {
    id: number;
    mentorId: number;
    mentoradoId: number;
    disciplinaId: number;
    dataHora: Date;
    duracaoMinutos: number;
    linkReuniao: string;
    feedbackMentorado?: string | undefined;
    status: "agendada" | "concluida" | "cancelada";
}

export interface BasicSessaoDTO {
    disciplinaId: number;
    dataHora: Date;
    duracaoMinutos: number;
    status: "agendada" | "concluida" | "cancelada";
}