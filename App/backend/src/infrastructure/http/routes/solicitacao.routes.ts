import { Router } from "express";
import { SolicitacaoFactory } from "../../../factories/SolicitacaoFactory.js";

const router = Router();
const controller = SolicitacaoFactory.criarSolicitacaoController();

    /**
     * @openapi
     * /solicitacoes:
     *   post:
     *     tags:
     *       - Solicitações
     *     summary: Cria uma nova solicitação
     *     description: Cria uma solicitação de mentoria, selecionando automaticamente os slots disponíveis do mentor.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CriarSolicitacao'
     *     responses:
     *       201:
     *         description: Solicitação criada com sucesso.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Solicitacao'
     *       400:
     *         description: Requisição inválida.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post("/solicitacoes", (req, res) => controller.criarSolicitacao(req, res));

    /**
     * @openapi
     * /solicitacoes/pendentes/{mentorId}:
     *   get:
     *     tags:
     *       - Solicitações
     *     summary: Lista solicitações pendentes de um mentor
     *     description: Retorna as solicitações pendentes para o mentor informado.
     *     parameters:
     *       - in: path
     *         name: mentorId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Identificador do mentor.
     *     responses:
     *       200:
     *         description: Lista de solicitações pendentes.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CriarSolicitacao'
     *       400:
     *         description: Requisição inválida.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get("/solicitacoes/pendentes/:mentorId", (req, res) => controller.listarSolicitacoesPendentes(req, res));

    /**
     * @openapi
     * /solicitacoes:
     *   put:
     *     tags:
     *       - Solicitações
     *     summary: Atualiza o status de uma solicitação
     *     description: Aceita ou recusa uma solicitação pendente.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AtualizarSolicitacao'
     *     responses:
     *       200:
     *         description: Solicitação atualizada com sucesso.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Solicitacao'
     *       400:
     *         description: Requisição inválida.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Solicitação não encontrada ou já processada.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
router.put("/solicitacoes", (req, res) => controller.atualizarSolicitacao(req, res));

export default router;