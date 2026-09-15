import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SENHA_PADRAO = "12345678";
const SLOT_DURATION_MINUTES = 15;

/**
 * Monta uma data futura a partir de hoje.
 * Ex.: diaFuturo(1, 14) = amanhã às 14:00.
 */
function diaFuturo(offsetDias: number, hora: number): Date {
  const data = new Date();
  data.setDate(data.getDate() + offsetDias);
  data.setHours(hora, 0, 0, 0);
  return data;
}

/** Cria um bloco de N slots consecutivos de 15 minutos a partir de `inicio`. */
async function criarBlocoDeSlots(
  mentorId: number,
  inicio: Date,
  duracaoTotalMinutos: number,
) {
  const slots = [];
  const quantidadeSlots = duracaoTotalMinutos / SLOT_DURATION_MINUTES;

  for (let i = 0; i < quantidadeSlots; i++) {
    slots.push(
      await prisma.slot.create({
        data: {
          mentorId,
          disciplinaId: 0,
          dataHora: new Date(
            inicio.getTime() + i * SLOT_DURATION_MINUTES * 60_000,
          ),
          duracaoMinutos: SLOT_DURATION_MINUTES,
          status: "disponivel",
        },
      }),
    );
  }

  return slots;
}

async function main() {
  // Limpa o banco para permitir reexecuções (ordem respeita as dependências).
  await prisma.sessao.deleteMany();
  await prisma.solicitacao.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.disciplina.deleteMany();

  const senhaHash = bcrypt.hashSync(SENHA_PADRAO, 10);

  // ---------- Disciplinas ----------
  const calculoI = await prisma.disciplina.create({
    data: {
      nome: "Cálculo I",
      descricao: "Limites, derivadas e integrais de funções de uma variável.",
    },
  });
  const programacaoI = await prisma.disciplina.create({
    data: {
      nome: "Programação I",
      descricao: "Lógica de programação e introdução a algoritmos.",
    },
  });
  const estruturaDeDados = await prisma.disciplina.create({
    data: {
      nome: "Estrutura de Dados",
      descricao: "Listas, pilhas, filas, árvores e algoritmos de busca e ordenação.",
    },
  });
  const fisicaI = await prisma.disciplina.create({
    data: {
      nome: "Física I",
      descricao: "Mecânica clássica: cinemática, dinâmica e energia.",
    },
  });
  const bancoDeDados = await prisma.disciplina.create({
    data: {
      nome: "Banco de Dados",
      descricao: "Modelagem, SQL e projeto de bancos de dados relacionais.",
    },
  });
  const engenhariaDeSoftware = await prisma.disciplina.create({
    data: {
      nome: "Engenharia de Software",
      descricao: "Processos, requisitos, arquitetura e testes de software.",
    },
  });

  // ---------- Usuários ----------
  const carlos = await prisma.usuario.create({
    data: {
      nome: "Carlos Silva",
      email: "carlos@uni.edu",
      senhaHash,
      perfil: "mentor",
      disciplinas: { connect: [{ id: calculoI.id }, { id: fisicaI.id }] },
    },
  });
  const ana = await prisma.usuario.create({
    data: {
      nome: "Ana Rodrigues",
      email: "ana@uni.edu",
      senhaHash,
      perfil: "mentor",
      disciplinas: {
        connect: [{ id: programacaoI.id }, { id: estruturaDeDados.id }],
      },
    },
  });
  const pedro = await prisma.usuario.create({
    data: {
      nome: "Pedro Santos",
      email: "pedro@uni.edu",
      senhaHash,
      perfil: "mentor",
      disciplinas: {
        connect: [{ id: bancoDeDados.id }, { id: engenhariaDeSoftware.id }],
      },
    },
  });
  const joao = await prisma.usuario.create({
    data: {
      nome: "João Alves",
      email: "joao@uni.edu",
      senhaHash,
      perfil: "mentorado",
      disciplinas: { connect: [{ id: calculoI.id }, { id: programacaoI.id }] },
    },
  });
  const maria = await prisma.usuario.create({
    data: {
      nome: "Maria Costa",
      email: "maria@uni.edu",
      senhaHash,
      perfil: "mentorado",
      disciplinas: { connect: [{ id: bancoDeDados.id }] },
    },
  });

  // ---------- Slots futuros (blocos de 60 min = 4 slots de 15 min) ----------
  // Carlos: amanhã 14:00 e depois de amanhã 10:00
  const carlosBloco1 = await criarBlocoDeSlots(carlos.id, diaFuturo(1, 14), 60);
  await criarBlocoDeSlots(carlos.id, diaFuturo(2, 10), 60);

  // Ana: amanhã 16:00 e em 3 dias 10:00
  await criarBlocoDeSlots(ana.id, diaFuturo(1, 16), 60);
  await criarBlocoDeSlots(ana.id, diaFuturo(3, 10), 60);

  // Pedro: depois de amanhã 14:00 (será usado pela sessão) e em 3 dias 16:00
  const pedroBloco1 = await criarBlocoDeSlots(pedro.id, diaFuturo(2, 14), 60);
  await criarBlocoDeSlots(pedro.id, diaFuturo(3, 16), 60);

  // ---------- Solicitação pendente: João -> Carlos (Cálculo I) ----------
  await prisma.solicitacao.create({
    data: {
      mentorId: carlos.id,
      mentoradoId: joao.id,
      disciplinaId: calculoI.id,
      dataHora: carlosBloco1[0]!.dataHora,
      duracaoMinutos: 60,
      status: "pendente",
      slots: { connect: carlosBloco1.map((slot) => ({ id: slot.id })) },
    },
  });

  // ---------- Sessão agendada: Maria -> Pedro (Banco de Dados) ----------
  // Os slots do bloco ficam indisponíveis e vinculados à disciplina.
  await prisma.slot.updateMany({
    where: { id: { in: pedroBloco1.map((slot) => slot.id) } },
    data: { status: "indisponivel", disciplinaId: bancoDeDados.id },
  });

  await prisma.sessao.create({
    data: {
      mentorId: pedro.id,
      mentoradoId: maria.id,
      disciplinaId: bancoDeDados.id,
      dataHora: pedroBloco1[0]!.dataHora,
      duracaoMinutos: 60,
      status: "agendada",
      slots: { connect: pedroBloco1.map((slot) => ({ id: slot.id })) },
    },
  });

  // ---------- Resumo ----------
  const [totalUsuarios, totalDisciplinas, totalSlots, totalSolicitacoes, totalSessoes] =
    await Promise.all([
      prisma.usuario.count(),
      prisma.disciplina.count(),
      prisma.slot.count(),
      prisma.solicitacao.count(),
      prisma.sessao.count(),
    ]);

  console.log("\nSeed concluído com sucesso!");
  console.log("-----------------------------------------");
  console.log(`Usuários:      ${totalUsuarios} (3 mentores e 2 mentorados)`);
  console.log(`Disciplinas:   ${totalDisciplinas}`);
  console.log(`Slots:         ${totalSlots}`);
  console.log(`Solicitações:  ${totalSolicitacoes} (pendente)`);
  console.log(`Sessões:       ${totalSessoes} (agendada)`);
  console.log("-----------------------------------------");
  console.log(`Senha de todos os usuários: ${SENHA_PADRAO}`);
  console.log(
    "   carlos@uni.edu | ana@uni.edu | pedro@uni.edu | joao@uni.edu | maria@uni.edu\n",
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Erro ao executar o seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
