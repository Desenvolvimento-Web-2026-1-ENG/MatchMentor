-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perfil" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    "disciplinaId" INTEGER NOT NULL DEFAULT 0,
    "dataHora" DATETIME NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponivel'
);

-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    "mentoradoId" INTEGER NOT NULL,
    "disciplinaId" INTEGER NOT NULL,
    "dataHora" DATETIME NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente'
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mentorId" INTEGER NOT NULL,
    "mentoradoId" INTEGER NOT NULL,
    "disciplinaId" INTEGER NOT NULL,
    "dataHora" DATETIME NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "linkReuniao" TEXT NOT NULL DEFAULT '',
    "feedbackMentorado" TEXT,
    "status" TEXT NOT NULL DEFAULT 'agendada'
);

-- CreateTable
CREATE TABLE "_DisciplinaToUsuario" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DisciplinaToUsuario_A_fkey" FOREIGN KEY ("A") REFERENCES "Disciplina" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DisciplinaToUsuario_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SlotToSolicitacao" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_SlotToSolicitacao_A_fkey" FOREIGN KEY ("A") REFERENCES "Slot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SlotToSolicitacao_B_fkey" FOREIGN KEY ("B") REFERENCES "Solicitacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SessaoToSlot" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_SessaoToSlot_A_fkey" FOREIGN KEY ("A") REFERENCES "Sessao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SessaoToSlot_B_fkey" FOREIGN KEY ("B") REFERENCES "Slot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Disciplina_nome_key" ON "Disciplina"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "_DisciplinaToUsuario_AB_unique" ON "_DisciplinaToUsuario"("A", "B");

-- CreateIndex
CREATE INDEX "_DisciplinaToUsuario_B_index" ON "_DisciplinaToUsuario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SlotToSolicitacao_AB_unique" ON "_SlotToSolicitacao"("A", "B");

-- CreateIndex
CREATE INDEX "_SlotToSolicitacao_B_index" ON "_SlotToSolicitacao"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SessaoToSlot_AB_unique" ON "_SessaoToSlot"("A", "B");

-- CreateIndex
CREATE INDEX "_SessaoToSlot_B_index" ON "_SessaoToSlot"("B");
