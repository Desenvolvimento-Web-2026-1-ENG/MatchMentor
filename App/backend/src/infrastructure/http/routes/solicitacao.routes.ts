import { Router } from "express";
import { SolicitacaoFactory } from "../../../factories/SolicitacaoFactory.js";

const router = Router();
const controller = SolicitacaoFactory.criarSolicitacaoController();

router.post("/solicitacoes", (req, res) => controller.criarSolicitacao(req, res));
router.get("/solicitacoes/pendentes/:mentorId", (req, res) => controller.listarSolicitacoesPendentes(req, res));
router.put("/solicitacoes", (req, res) => controller.atualizarSolicitacao(req, res));

export default router;