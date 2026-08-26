import { Router } from "express";
import { SessaoFactory } from "../../../factories/SessaoFactory.js";

const router = Router();
const controller = SessaoFactory.criarSessaoController();

/**
 * @openapi
 * /sessoes:
 *   post:
 *     tags:
 *       - Sessões
 *     summary: Cria uma sessão a partir de uma solicitação
 *     description: Cria uma sessão a partir de uma solicitação já aceita, informando o id da solicitação.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarSessao'
 *     responses:
 *       201:
 *         description: Sessão criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sessao'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/sessoes", (req, res) => controller.criarSessao(req, res));

/**
 * @openapi
 * /usuarios/{usuarioId}/sessoes/{perfil}:
 *   get:
 *     tags:
 *       - Sessões
 *     summary: Lista sessões de um usuário por perfil
 *     description: Retorna as sessões do usuário, de acordo com o perfil (mentor ou mentorado).
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador do usuário.
 *       - in: path
 *         name: perfil
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - mentor
 *             - mentorado
 *         description: Perfil do usuário.
 *     responses:
 *       200:
 *         description: Lista de sessões do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BasicSessao'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/usuarios/:usuarioId/sessoes/:perfil", (req, res) => controller.listarSessoes(req, res));

/**
 * @openapi
 * /sessoes:
 *   put:
 *     tags:
 *       - Sessões
 *     summary: Atualiza o status de uma sessão
 *     description: Marca uma sessão agendada como concluída ou cancelada. Ao cancelar, os slots associados voltam a ficar disponíveis.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarSessao'
 *     responses:
 *       200:
 *         description: Sessão atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicSessao'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/sessoes", (req, res) => controller.atualizarStatusSessao(req, res));

/**
 * @openapi
 * /sessoes/{sessaoId}:
 *   get:
 *     tags:
 *       - Sessões
 *     summary: Obtém os detalhes de uma sessão
 *     description: Retorna os detalhes completos da sessão informada.
 *     parameters:
 *       - in: path
 *         name: sessaoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador da sessão.
 *     responses:
 *       200:
 *         description: Detalhes da sessão.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetalhesSessao'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/sessoes/:sessaoId", (req, res) => controller.detalhesSessao(req, res));

export default router;