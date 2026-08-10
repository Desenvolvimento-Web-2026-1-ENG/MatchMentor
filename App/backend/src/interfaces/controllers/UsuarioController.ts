import type { UsuarioService } from "../../services/UsuarioService.js";

export class UsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  cadastrar(req: any, res: any) {
    try {
      const usuario = this.usuarioService.criarUsuario(req.body);
      res.status(201).json(usuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}