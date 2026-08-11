import { Router } from "express";
import { SolicitacaoFactory } from "../../../factories/SolicitacaoFactory.js";

const router = Router();
const controller = SolicitacaoFactory.criarSolicitacaoController();

router.post("/solicitacoes", (req, res) => controller.criarSolicitacao(req, res));
router.get("/solicitacoes/pendentes/:mentorId", (req, res) => controller.listarSolicitacoesPendentes(req, res));
router.post("/solicitacoes/processar", (req, res) => controller.processarSolicitacao(req, res));

export default router;