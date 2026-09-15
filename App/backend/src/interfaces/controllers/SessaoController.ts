import type { SessaoService } from "../../services/SessaoService.js";

export class SessaoController {
  constructor(private sessaoService: SessaoService) {}

  async listarSessoes(req: any, res: any) {
    try {
      const { usuarioId, perfil } = req.params;
      let sessoes;
      if (perfil === "mentor") {
        sessoes = await this.sessaoService.buscarSessoesPorMentor(Number(usuarioId));
      } else if (perfil === "mentorado") {
        sessoes = await this.sessaoService.buscarSessoesPorMentorado(
          Number(usuarioId),
        );
      } else {
        res.status(400).json({ error: "Perfil inválido." });
        return;
      }
      res.status(200).json(sessoes);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async atualizarStatusSessao(req: any, res: any) {
    try {
      const sessaoAtualizada = await this.sessaoService.atualizarStatusSessao(
        Number(req.body.id),
        req.body.status
      );
      res.status(200).json(sessaoAtualizada);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async detalhesSessao(req: any, res: any) {
    try {
      const { sessaoId } = req.params;
      const sessao = await this.sessaoService.buscarSessaoPorId(Number(sessaoId));
      res.status(200).json(sessao);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async criarSessao(req: any, res: any) {
    try {
      const solicitacao = req.body;
      const sessao = await this.sessaoService.criarSessao(solicitacao);
      res.status(201).json(sessao);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
