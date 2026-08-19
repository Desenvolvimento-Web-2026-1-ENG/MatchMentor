import { Router } from "express";
import { UsuarioFactory } from "../../../factories/UsuarioFactory.js";

const router = Router();
const controller = UsuarioFactory.criarUsuarioController();

router.post("/usuarios", (req, res) => controller.cadastrar(req, res));
router.get("/usuarios/mentores/:disciplinaId", (req, res) => controller.buscarMentoresPorDisciplina(req, res));
export default router;