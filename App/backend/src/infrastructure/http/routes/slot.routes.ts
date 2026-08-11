import { Router } from "express";
import { SlotFactory } from "../../../factories/SlotFactory.js";

const router = Router();
const controller = SlotFactory.criarSlotController();

router.post("/slots", (req, res) => controller.criar(req, res));
router.get("/mentores/:mentorId/slots", (req, res) =>
  controller.listarMeusSlots(req, res),
);
router.put("/slots", (req, res) => controller.editar(req, res));
router.delete("/slots/:slotId", (req, res) => controller.remover(req, res));
router.get("/mentores/:mentorId/slots/disponiveis", (req, res) =>
  controller.listarSlotsDisponiveis(req, res),
);

export default router;