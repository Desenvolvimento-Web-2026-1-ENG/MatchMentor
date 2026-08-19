import { Router } from "express";
import { UsuarioFactory } from "../../../factories/UsuarioFactory.js";

const router = Router();
const controller = UsuarioFactory.criarUsuarioController();

/**
 * @openapi
 * /usuarios:
 *   post:
 *     tags:
 *       - Usuários
 *     summary: Cadastra um novo usuário
 *     description: Cria um usuário (mentor ou mentorado) na plataforma. A senha é armazenada como hash.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarUsuario'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/usuarios", (req, res) => controller.cadastrar(req, res));

/**
 * @openapi
 * /usuarios/mentores/{disciplinaId}:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista mentores de uma disciplina
 *     description: Retorna os mentores que possuem slots disponíveis para a disciplina informada.
 *     parameters:
 *       - in: path
 *         name: disciplinaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador da disciplina.
 *     responses:
 *       200:
 *         description: Lista de mentores encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/usuarios/mentores/:disciplinaId", (req, res) => controller.buscarMentoresPorDisciplina(req, res));
export default router;