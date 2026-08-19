import type { CriarSolicitacaoDTO } from "../../services/dtos/SolicitacaoDTO.js";
import type { SolicitacaoService } from "../../services/SolicitacaoService.js";

export class SolicitacaoController {
  constructor(private solicitacaoService: SolicitacaoService) {}

    criarSolicitacao(req: any, res: any) {
        try {
            req.body.dataHora = new Date(req.body.dataHora);
            const solicitacaoDTO: CriarSolicitacaoDTO = req.body;
            const solicitacao = this.solicitacaoService.criarSolicitacao(solicitacaoDTO);
            res.status(201).json(solicitacao);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    listarSolicitacoesPendentes(req: any, res: any) {
        try {
            const { mentorId } = req.params;
            const solicitacoes = this.solicitacaoService.listarSolicitacoesPendentes(Number(mentorId));
            res.status(200).json(solicitacoes);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    atualizarSolicitacao(req: any, res: any) {
        try {
            const { solicitacaoId, status } = req.body;
            const sucesso = this.solicitacaoService.atualizarSolicitacao(Number(solicitacaoId), status);
            if (!sucesso) {
                res.status(404).json({ error: "Solicitação não encontrada ou já processada." });
                return;
            }
            res.status(200).json(sucesso);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

}