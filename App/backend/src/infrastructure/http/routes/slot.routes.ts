import { Router } from "express";
import { SlotFactory } from "../../../factories/SlotFactory.js";

const router = Router();
const controller = SlotFactory.criarSlotController();

/**
 * @openapi
 * /slots:
 *   post:
 *     tags:
 *       - Slots
 *     summary: Cria um novo slot
 *     description: Cria um slot de disponibilidade para um mentor. A duração padrão é de 30 minutos e o status inicial é "disponivel".
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarSlot'
 *     responses:
 *       201:
 *         description: Slot criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/slots", (req, res) => controller.criar(req, res));

/**
 * @openapi
 * /mentores/{mentorId}/slots:
 *   get:
 *     tags:
 *       - Slots
 *     summary: Lista slots de um mentor
 *     description: Retorna todos os slots cadastrados para o mentor informado.
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador do mentor.
 *     responses:
 *       200:
 *         description: Lista de slots do mentor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/mentores/:mentorId/slots", (req, res) =>
  controller.listarMeusSlots(req, res),
);

/**
 * @openapi
 * /slots:
 *   put:
 *     tags:
 *       - Slots
 *     summary: Atualiza um slot
 *     description: Atualiza os dados de um slot existente, identificado pelo id no corpo da requisição.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Slot'
 *     responses:
 *       200:
 *         description: Slot atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Slot não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/slots", (req, res) => controller.editar(req, res));

/**
 * @openapi
 * /slots/{slotId}:
 *   delete:
 *     tags:
 *       - Slots
 *     summary: Remove um slot
 *     description: Exclui o slot informado.
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador do slot.
 *     responses:
 *       200:
 *         description: Slot removido com sucesso.
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
 *       404:
 *         description: Slot não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/slots/:slotId", (req, res) => controller.remover(req, res));

/**
 * @openapi
 * /mentores/{mentorId}/slots/disponiveis:
 *   get:
 *     tags:
 *       - Slots
 *     summary: Lista slots disponíveis de um mentor
 *     description: Retorna os slots disponíveis (com data futura) do mentor informado.
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador do mentor.
 *     responses:
 *       200:
 *         description: Lista de slots disponíveis.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/mentores/:mentorId/slots/disponiveis", (req, res) =>
  controller.listarSlotsDisponiveis(req, res),
);

export default router;