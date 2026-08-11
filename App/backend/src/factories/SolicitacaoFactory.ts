import { solicitacaoService } from "./Container.js";
import { SolicitacaoController } from "../interfaces/controllers/SolicitacaoController.js";


export class SolicitacaoFactory {
  static criarSolicitacaoController(): SolicitacaoController {
    return new SolicitacaoController(solicitacaoService);
  }
}