import { Router } from "express";
import { DisciplinaFactory } from "../../../factories/DisciplinaFactory.js";

const router = Router();
const controller = DisciplinaFactory.criarDisciplinaController();

router.post("/disciplinas", (req, res) => controller.criarDisciplina(req, res));
router.post("/disciplinas/adicionar", (req, res) => controller.adicionarDisciplinaAoUsuario(req, res));
router.post("/disciplinas/remover", (req, res) => controller.removerDisciplinaDoUsuario(req, res));
router.get("/usuarios/:usuarioId/disciplinas", (req, res) => controller.buscarDisciplinasUsuario(req, res));

export default router;
