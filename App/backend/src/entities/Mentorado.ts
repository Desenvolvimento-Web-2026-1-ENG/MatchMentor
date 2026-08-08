import type { Usuario } from "./Usuario.js";
import type { Disciplina } from "./Disciplina.js";

export interface Mentorado extends Usuario {
  disciplinasInteresse: Disciplina[];
}