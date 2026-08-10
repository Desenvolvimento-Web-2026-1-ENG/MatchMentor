import type { Mentorado } from "../../entities/Mentorado.js";
import type { Mentor } from "../../entities/Mentor.js";
import type { Disciplina } from "../../entities/Disciplina.js";
import type { DisciplinaService } from "../../services/DisciplinaService.js";
import type { UsuarioService } from "../../services/UsuarioService.js";

export class DisciplinaController {
  constructor(private disciplinaService: DisciplinaService, private usuarioService: UsuarioService) {}

  criarDisciplina(req: any, res: any) {
    try {
      const disciplina = this.disciplinaService.criarDisciplina(req.body);
      res.status(201).json(disciplina);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  adicionarDisciplinaAoUsuario(req: any, res: any) {
    try {
      const { usuarioId, disciplinaId } = req.body;
      this.disciplinaService.adicionarDisciplinaAoUsuario(usuarioId, disciplinaId);
      res.status(200).json({ message: "Disciplina adicionada ao usuário com sucesso." });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  removerDisciplinaDoUsuario(req: any, res: any) {
    try {
      const { usuarioId, disciplinaId } = req.body;
      this.disciplinaService.removerDisciplinaDoUsuario(usuarioId, disciplinaId);
      res.status(200).json({ message: "Disciplina removida do usuário com sucesso." });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  buscarDisciplinasUsuario(req: any, res: any) {
    try {
      const { usuarioId } = req.params;
      const usuario = this.usuarioService.buscarUsuarioPorId(Number(usuarioId));
      if (!usuario) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }

      let disciplinas: Disciplina[] = [];
      switch (usuario.perfil) {
        case "mentor":
          disciplinas = (usuario as Mentor).disciplinasMentoradas;
          break;
        case "mentorado":
          disciplinas = (usuario as Mentorado).disciplinasInteresse;
          break;
        default:
          res.status(400).json({ error: "Perfil de usuário desconhecido." });
          return;
      }

      res.status(200).json(disciplinas);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  } 
}