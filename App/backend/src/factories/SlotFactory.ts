import { SlotController } from "../interfaces/controllers/SlotController.js";
import { slotService } from "./Container.js";

export class SlotFactory {
  static criarSlotController() {
    return new SlotController(slotService);
  }
}