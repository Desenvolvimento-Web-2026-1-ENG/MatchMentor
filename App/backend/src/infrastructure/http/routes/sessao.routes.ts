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
 *     description: Cria uma sessão para uma solicitação que já esteja aceita. Os slots da solicitação são marcados como indisponíveis.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Solicitacao'
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
 * /sessoes/{sessaoId}:
 *   put:
 *     tags:
 *       - Sessões
 *     summary: Marca uma sessão como realizada
 *     description: Atualiza o status de uma sessão agendada para concluída.
 *     parameters:
 *       - in: path
 *         name: sessaoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador da sessão.
 *     responses:
 *       200:
 *         description: Indica se a operação foi bem-sucedida.
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/sessoes/:sessaoId", (req, res) => controller.atualizarStatusSessao(req, res));

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