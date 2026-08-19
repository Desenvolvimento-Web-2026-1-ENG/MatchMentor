import { UsuarioService } from '../services/UsuarioService.js';
import { UsuarioRepositoryInMemory } from '../infrastructure/database/UsuarioRepositoryInMemory.js';
import { SessaoRepositoryInMemory } from '../infrastructure/database/SessaoRepositoryInMemory.js';
import { SlotRepositoryInMemory } from '../infrastructure/database/SlotRepositoryInMemory.js';
import { DisciplinaRepositoryInMemory } from '../infrastructure/database/DisciplinaRepositoryInMemory.js';
import { SolicitacaoRepositoryInMemory } from '../infrastructure/database/SolicitacaoRepositoryInMemory.js';
import { DisciplinaService } from '../services/DisciplinaService.js';
import { SessaoService } from '../services/SessaoService.js';
import { SlotService } from '../services/SlotService.js';
import { SolicitacaoService } from '../services/SolicitacaoService.js';


const disciplinaRepository = new DisciplinaRepositoryInMemory();
const sessaoRepository = new SessaoRepositoryInMemory();
const slotRepository = new SlotRepositoryInMemory();
const solicitacaoRepository = new SolicitacaoRepositoryInMemory();
const usuarioRepository = new UsuarioRepositoryInMemory();

const disciplinaService = new DisciplinaService(disciplinaRepository, usuarioRepository);
const solicitacaoService = new SolicitacaoService(slotRepository, solicitacaoRepository);
const sessaoService = new SessaoService(sessaoRepository, slotRepository);
const slotService = new SlotService(slotRepository);
const usuarioService = new UsuarioService(usuarioRepository, slotRepository);

export {
  disciplinaService,
  solicitacaoService,
  sessaoService,
  slotService,
  usuarioService,
};