import type { UsuarioService } from "../../services/UsuarioService.js";

export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  async cadastrar(req: any, res: any) {
    try {
      const usuario = await this.usuarioService.criarUsuario(req.body);
      res.status(201).json(usuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async buscarMentoresPorDisciplina(req: any, res: any) {
    try {
      const { disciplinaId } = req.params;
      const mentores = await this.usuarioService.buscarMentoresPorDisciplina(Number(disciplinaId));
      res.status(200).json(mentores);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}