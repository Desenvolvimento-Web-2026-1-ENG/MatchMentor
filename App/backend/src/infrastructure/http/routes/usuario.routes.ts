import { Router } from "express";
import { UsuarioFactory } from "../../../factories/UsuarioFactory.js";

const router = Router();
const controller = UsuarioFactory.criarUsuarioController();

router.post("/usuarios", (req, res) => controller.cadastrar(req, res));
export default router;