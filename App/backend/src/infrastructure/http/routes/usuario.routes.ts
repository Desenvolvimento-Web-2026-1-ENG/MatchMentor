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
 * /usuarios:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista todos os usuários
 *     description: Retorna os usuários cadastrados (id, nome, email, perfil e disciplinas), ordenados por id. Alimenta o seletor de login e a busca de mentores sem filtro de disciplina.
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DadosBasicosUsuario'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/usuarios", (req, res) => controller.listarUsuarios(req, res));

/**
 * @openapi
 * /usuarios/mentores/{disciplinaId}:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Lista mentores de uma disciplina
 *     description: Retorna os mentores que possuem slots disponíveis (futuros) para a disciplina informada.
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
 *                 $ref: '#/components/schemas/DadosBasicosUsuario'
 *       400:
 *         description: Requisição inválida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/usuarios/mentores/:disciplinaId", (req, res) => controller.buscarMentoresPorDisciplina(req, res));

/**
 * @openapi
 * /usuarios/{usuarioId}:
 *   get:
 *     tags:
 *       - Usuários
 *     summary: Obtém os dados de um usuário
 *     description: Retorna os dados do usuário informado (id, nome, email, perfil e disciplinas).
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador do usuário.
 *     responses:
 *       200:
 *         description: Dados do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DadosBasicosUsuario'
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
router.get("/usuarios/:usuarioId", (req, res) => controller.buscarUsuarioPorId(req, res));

export default router;