import type { Disciplina } from "./Disciplina.js";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  dataCriacao: Date;
  perfil: "mentor" | "mentorado";
}