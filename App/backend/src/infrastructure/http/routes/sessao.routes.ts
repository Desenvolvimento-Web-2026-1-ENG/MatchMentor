import { Router } from "express";
import { SessaoFactory } from "../../../factories/SessaoFactory.js";

const router = Router();
const controller = SessaoFactory.criarSessaoController();

router.post("/sessoes", (req, res) => controller.criarSessao(req, res));
router.get("/usuarios/:usuarioId/sessoes/:perfil", (req, res) => controller.listarSessoes(req, res));
router.put("/sessoes/:sessaoId", (req, res) => controller.atualizarStatusSessao(req, res));
router.get("/sessoes/:sessaoId", (req, res) => controller.detalhesSessao(req, res));

export default router;