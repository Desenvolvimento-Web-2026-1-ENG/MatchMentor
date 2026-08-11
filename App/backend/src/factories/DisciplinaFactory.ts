import { disciplinaService, usuarioService } from "./Container.js";
import { DisciplinaController } from "../interfaces/controllers/DisciplinaController.js";

export class DisciplinaFactory {
  static criarDisciplinaController(): DisciplinaController {
    return new DisciplinaController(disciplinaService, usuarioService);
  }
}