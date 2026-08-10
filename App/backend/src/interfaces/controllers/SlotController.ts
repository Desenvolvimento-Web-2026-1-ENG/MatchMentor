import type { SlotService } from "../../services/SlotService.js";

export class SlotController {
  constructor(private slotService: SlotService) {}

  criar(req: any, res: any) {
    try {
      const slot = this.slotService.criar(req.body);
      res.status(201).json(slot);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  listarMeusSlots(req: any, res: any) {
    try {
      const { mentorId } = req.params;
      const slots = this.slotService.buscarPorMentor(Number(mentorId));
      res.status(200).json(slots);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  editar(req: any, res: any) {
    try {
      const slot = this.slotService.atualizar(req.body);
      if (!slot) {
        res.status(404).json({ error: "Slot não encontrado." });
        return;
      }
      res.status(200).json(slot);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  remover(req: any, res: any) {
    try {
      const { slotId } = req.params;
      const sucesso = this.slotService.deletar(Number(slotId));
      if (!sucesso) {
        res.status(404).json({ error: "Slot não encontrado." });
        return;
      }
      res.status(200).json({ message: "Slot removido com sucesso." });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  listarSlotsDisponiveis(req: any, res: any) {
    try {
      const { mentorId } = req.params;
      const slots = this.slotService.buscarDisponiveisPorMentor(
        Number(mentorId),
      );
      res.status(200).json(slots);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
