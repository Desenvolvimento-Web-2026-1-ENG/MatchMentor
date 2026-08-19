import { Router } from "express";
import { DisciplinaFactory } from "../../../factories/DisciplinaFactory.js";

const router = Router();
const controller = DisciplinaFactory.criarDisciplinaController();

/**
 * @openapi
 * /disciplinas:
 *   post:
 *     tags:
 *       - Disciplinas
 *     summary: Cria uma nova disciplina
 *     description: Cadastra uma disciplina na plataforma.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarDisciplina'
 *     responses:
 *       201:
 *         description: Disciplina criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disciplina'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/disciplinas", (req, res) => controller.criarDisciplina(req, res));

/**
 * @openapi
 * /disciplinas/adicionar:
 *   post:
 *     tags:
 *       - Disciplinas
 *     summary: Adiciona uma disciplina a um usuário
 *     description: Associa uma disciplina existente ao usuário informado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VinculoDisciplina'
 *     responses:
 *       200:
 *         description: Disciplina adicionada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/disciplinas/adicionar", (req, res) => controller.adicionarDisciplinaAoUsuario(req, res));

/**
 * @openapi
 * /disciplinas/remover:
 *   post:
 *     tags:
 *       - Disciplinas
 *     summary: Remove uma disciplina de um usuário
 *     description: Desassocia uma disciplina do usuário informado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VinculoDisciplina'
 *     responses:
 *       200:
 *         description: Disciplina removida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/disciplinas/remover", (req, res) => controller.removerDisciplinaDoUsuario(req, res));

/**
 * @openapi
 * /usuarios/{usuarioId}/disciplinas:
 *   get:
 *     tags:
 *       - Disciplinas
 *     summary: Lista disciplinas de um usuário
 *     description: Retorna as disciplinas associadas ao usuário informado.
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador do usuário.
 *     responses:
 *       200:
 *         description: Lista de disciplinas do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Disciplina'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/usuarios/:usuarioId/disciplinas", (req, res) => controller.buscarDisciplinasUsuario(req, res));

export default router;
