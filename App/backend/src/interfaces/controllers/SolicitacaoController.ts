import type { CriarSolicitacaoDTO } from "../../services/dtos/SolicitacaoDTO.js";
import type { MatchMakingService } from "../../services/MatchMakingService.js";

export class SolicitacaoController {
  constructor(private matchMakingService: MatchMakingService) {}

    criarSolicitacao(req: any, res: any) {
        try {
            const solicitacaoDTO: CriarSolicitacaoDTO = req.body;
            const solicitacao = this.matchMakingService.criarSolicitacao(solicitacaoDTO);
            res.status(201).json(solicitacao);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    listarSolicitacoesPendentes(req: any, res: any) {
        try {
            const { mentorId } = req.params;
            const solicitacoes = this.matchMakingService.listarSolicitacoesPendentes(Number(mentorId));
            res.status(200).json(solicitacoes);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    procesarSolicitacao(req: any, res: any) {
        try {
            const { solicitacaoId, status } = req.body;
            const sucesso = this.matchMakingService.procesarSolicitacao(Number(solicitacaoId), status);
            if (!sucesso) {
                res.status(404).json({ error: "Solicitação não encontrada ou já processada." });
                return;
            }
            res.status(200).json({ message: "Solicitação processada com sucesso." });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}