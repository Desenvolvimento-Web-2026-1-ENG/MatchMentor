import type { Disciplina } from "../../entities/Disciplina.js";
import type { DisciplinaService } from "../../services/DisciplinaService.js";
import type { UsuarioService } from "../../services/UsuarioService.js";

export class DisciplinaController {
  constructor(private disciplinaService: DisciplinaService, private usuarioService: UsuarioService) {}

  async criarDisciplina(req: any, res: any) {
    try {
      const disciplina = await this.disciplinaService.criarDisciplina(req.body);
      res.status(201).json(disciplina);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async adicionarDisciplinaAoUsuario(req: any, res: any) {
    try {
      const { usuarioId, disciplinaId } = req.body;
      await this.disciplinaService.adicionarDisciplinaAoUsuario(usuarioId, disciplinaId);
      res.status(200).json({ message: "Disciplina adicionada ao usuário com sucesso." });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removerDisciplinaDoUsuario(req: any, res: any) {
    try {
      const { usuarioId, disciplinaId } = req.body;
      await this.disciplinaService.removerDisciplinaDoUsuario(usuarioId, disciplinaId);
      res.status(200).json({ message: "Disciplina removida do usuário com sucesso." });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async buscarDisciplinasUsuario(req: any, res: any) {
    try {
      const { usuarioId } = req.params;
      const usuario = await this.usuarioService.buscarUsuarioPorId(Number(usuarioId));
      if (!usuario) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }

      let disciplinas: Disciplina[] = [];
      disciplinas = usuario.disciplinas;

      res.status(200).json(disciplinas);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  } 
}