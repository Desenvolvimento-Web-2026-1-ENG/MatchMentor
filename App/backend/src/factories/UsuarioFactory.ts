import { usuarioService } from "./Container.js";
import { UsuarioController } from "../interfaces/controllers/UsuarioController.js";

export class UsuarioFactory {
  static criarUsuarioController(): UsuarioController {
    return new UsuarioController(usuarioService);
  }
}