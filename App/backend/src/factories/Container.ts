import { UsuarioService } from '../services/UsuarioService.js';
import { UsuarioRepositoryPrisma } from '../infrastructure/database/prisma/UsuarioRepositoryPrisma.js';
import { SessaoRepositoryPrisma } from '../infrastructure/database/prisma/SessaoRepositoryPrisma.js';
import { SlotRepositoryPrisma } from '../infrastructure/database/prisma/SlotRepositoryPrisma.js';
import { DisciplinaRepositoryPrisma } from '../infrastructure/database/prisma/DisciplinaRepositoryPrisma.js';
import { SolicitacaoRepositoryPrisma } from '../infrastructure/database/prisma/SolicitacaoRepositoryPrisma.js';
import { DisciplinaService } from '../services/DisciplinaService.js';
import { SessaoService } from '../services/SessaoService.js';
import { SlotService } from '../services/SlotService.js';
import { SolicitacaoService } from '../services/SolicitacaoService.js';


const disciplinaRepository = new DisciplinaRepositoryPrisma();
const sessaoRepository = new SessaoRepositoryPrisma();
const slotRepository = new SlotRepositoryPrisma();
const solicitacaoRepository = new SolicitacaoRepositoryPrisma();
const usuarioRepository = new UsuarioRepositoryPrisma();

const disciplinaService = new DisciplinaService(disciplinaRepository, usuarioRepository);
const solicitacaoService = new SolicitacaoService(slotRepository, solicitacaoRepository, usuarioRepository, disciplinaRepository);
const sessaoService = new SessaoService(sessaoRepository, slotRepository, solicitacaoRepository, usuarioRepository, disciplinaRepository);
const slotService = new SlotService(slotRepository);
const usuarioService = new UsuarioService(usuarioRepository, slotRepository);

export {
  disciplinaService,
  solicitacaoService,
  sessaoService,
  slotService,
  usuarioService,
};