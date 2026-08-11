import { SessaoController } from "../interfaces/controllers/SessaoController.js";
import { sessaoService } from "./Container.js";

export class SessaoFactory {
  static criarSessaoController() {
    return new SessaoController(sessaoService);
  }
}