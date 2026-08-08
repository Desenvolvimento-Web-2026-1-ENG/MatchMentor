import type { Usuario } from "./Usuario.js";
import type { Disciplina } from "./Disciplina.js";

export interface Mentor extends Usuario {
  disciplinasMentoradas: Disciplina[];
}
