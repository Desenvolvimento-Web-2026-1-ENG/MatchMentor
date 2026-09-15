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
    mentorNome: string;
    mentoradoNome: string;
    disciplinaNome: string;
}

export interface BasicSessaoDTO {
    id: number;
    mentorId: number;
    mentoradoId: number;
    disciplinaId: number;
    dataHora: Date;
    duracaoMinutos: number;
    status: "agendada" | "concluida" | "cancelada";
    mentorNome: string;
    mentoradoNome: string;
    disciplinaNome: string;
    slotIds: number[];
}