import type { SessaoService } from "../../services/SessaoService.js";

export class SessaoController {
  constructor(private sessaoService: SessaoService) {}  

  listarSessoes(req: any, res: any) {
    try {
      const { usuarioId, perfil } = req.params;
      let sessoes;
      if (perfil === "mentor") {
        sessoes = this.sessaoService.buscarSessoesPorMentor(Number(usuarioId));
      } else if (perfil === "mentorado") {
        sessoes = this.sessaoService.buscarSessoesPorMentorado(Number(usuarioId));
      } else {
        res.status(400).json({ error: "Perfil inválido." });
        return;
      }
      res.status(200).json(sessoes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  marcarComoRealizada(req: any, res: any) {
    try {
      const { sessaoId } = req.params;
      const sessaoAtualizada = this.sessaoService.marcarSessaoComoRealizada(Number(sessaoId));
      res.status(200).json(sessaoAtualizada);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  detalhesSessao(req: any, res: any) {
    try {
      const { sessaoId } = req.params;
      const sessao = this.sessaoService.buscarSessaoPorId(Number(sessaoId));
      res.status(200).json(sessao);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
