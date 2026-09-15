# 🎓 Sistema de Gestão de Mentorias

> Plataforma de matchmaking que conecta mentores a mentorados dentro do ambiente acadêmico.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Como Executar](#como-executar)
- [Documentação da API (OpenAPI)](#documentacao-da-api-openapi)
- [Fluxo de Uso](#fluxo-de-uso)
- [Status do Projeto](#status-do-projeto)

---

## 📌 Sobre o Projeto

O **MatchMentor** é uma plataforma de matchmaking que conecta mentores a mentorados dentro do ambiente acadêmico. O sistema permite que mentores cadastrem suas disciplinas de domínio e disponibilizem horários (slots), enquanto mentorados podem buscar mentores por disciplina e solicitar sessões de mentoria. O fluxo contempla desde o cadastro até a conclusão da sessão, com validação de conflitos de horário e gerenciamento automático de disponibilidade.

---

## ✅ Funcionalidades

- [x] Cadastro de usuários (mentor e mentorado)
- [x] Cadastro de disciplinas
- [x] Associação de disciplinas a usuários (adicionar/remover)
- [x] Consulta de disciplinas de um usuário
- [x] Criação de slots de disponibilidade pelos mentores
- [x] Edição e remoção de slots
- [x] Listagem de slots disponíveis de um mentor
- [x] Solicitação de mentoria pelo mentorado
- [x] Listagem de solicitações pendentes para o mentor
- [x] Processamento de solicitação (aceitar/recusar) e criação automática de sessão
- [x] Listagem de sessões por perfil (mentor/mentorado)
- [x] Marcar sessão como realizada
- [x] Visualização de detalhes de uma sessão
- [ ] Autenticação e autorização
- [ ] Feedback de mentorado pós-sessão
- [ ] Link de reunião 

---

## 🛠️ Tecnologias Utilizadas

| Camada          | Tecnologia              |
|-----------------|-------------------------|
| Back-end        | Node.js + Express (TypeScript) |
| Banco de Dados  | SQLite + Prisma ORM     |
| Autenticação    | — (planejado)           |
| Front-end       | — (planejado)           |
| Testes          | — (planejado)           |

---

## 🏗️ Arquitetura

O backend segue uma **arquitetura em camadas** com separação clara de responsabilidades:

```
App/backend/src/
├── entities/             # Modelos de domínio (interfaces TypeScript)
│   ├── Usuario.ts        #   Base: id, nome, email, senhaHash, perfil
│   ├── Mentor.ts         #   extends Usuario + disciplinasMentoradas
│   ├── Mentorado.ts      #   extends Usuario + disciplinasInteresse
│   ├── Disciplina.ts     #   id, nome, descricao
│   ├── Slot.ts / SlotBase.ts   # Bloco de 30min de disponibilidade
│   ├── Sessao.ts         #   Mentoria agendada com status e link
│   └── Solicitacao.ts    #   Pedido de mentoria (pendente/aceita/recusada)
├── services/             # Lógica de negócio
│   ├── UsuarioService.ts
│   ├── DisciplinaService.ts
│   ├── SlotService.ts
│   ├── SolicitacaoService.ts  # Gerencia fluxo solicitação → sessão
│   └── SessaoService.ts
├── repositories/         # Contratos de persistência (interfaces)
│   ├── IUsuarioRepository.ts
│   ├── IDisciplinaRepository.ts
│   ├── ISlotRepository.ts
│   ├── ISolicitacaoRepository.ts
│   └── ISessaoRepository.ts
├── infrastructure/
│   ├── database/         # Persistência: repositórios Prisma (SQLite) e in-memory (referência)
│   └── http/
│       ├── server.ts     # Configuração do Express (porta 3000, prefixo /api/v1)
│       └── routes/       # Definições das rotas por domínio
├── interfaces/
│   └── controllers/      # Handlers HTTP (parse da request → service → response)
└── factories/            # Composição de dependências (injeção manual)
```

**Padrões utilizados:**
- **Repository Pattern** — Contratos (`I*Repository`) com implementações em Prisma (SQLite) e versões in-memory mantidas para referência/testes
- **Service Layer** — Toda lógica de negócio isolada nos services
- **Factory Pattern** — Composição de dependências centralizada nas factories
- **DTOs** — Objetos de transferência para entrada/saída da API

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Monteiro-Jr-Dev/matchmentor.git

# Acesse a pasta do projeto
cd matchmentor/App/backend

# Instale as dependências
npm install

# Crie o arquivo de variáveis de ambiente (SQLite em prisma/dev.db)
cp .env.example .env

# Aplique as migrações e popule o banco com dados de demonstração
npm run prisma:migrate
npm run prisma:seed
```

### Execução

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Modo produção
npm run build && npm start

# Inspecionar o banco (interface visual do Prisma)
npm run prisma:studio
```

O servidor iniciará em `http://localhost:3000`. Todos os endpoints usam o prefixo `/api/v1`.

---

## 📚 Documentação da API (OpenAPI)

A API é documentada com **OpenAPI 3.0**, gerada dinamicamente a partir dos comentários `@openapi` nas rotas e dos modelos centralizados em `schemas.yaml`, usando `swagger-jsdoc` + `swagger-ui-express`.

Com o servidor em execução, acesse:

| Recurso | URL | Descrição |
|---------|-----|-----------|
| Swagger UI | `http://localhost:3000/api/v1/docs` | Interface gráfica interativa para explorar e testar os endpoints |
| JSON da especificação | `http://localhost:3000/api/v1/docs/json` | Especificação OpenAPI crua (importável no Postman, Insomnia etc.) |

> A especificação é gerada automaticamente a partir dos arquivos em `App/backend/src/infrastructure/http/routes/*.ts` (comentários `@openapi`) e `App/backend/src/infrastructure/http/docs/schemas.yaml` (schemas reutilizáveis).

### Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/usuarios` | Cadastra um usuário (mentor ou mentorado) |
| GET | `/api/v1/usuarios` | Lista todos os usuários (perfil e disciplinas) |
| GET | `/api/v1/usuarios/:usuarioId` | Obtém os dados de um usuário |
| GET | `/api/v1/usuarios/mentores/:disciplinaId` | Lista mentores de uma disciplina (com slots futuros disponíveis) |
| GET | `/api/v1/usuarios/:usuarioId/disciplinas` | Lista as disciplinas de um usuário |
| GET | `/api/v1/usuarios/:usuarioId/sessoes/:perfil` | Lista as sessões do usuário (`mentor` ou `mentorado`) |
| POST | `/api/v1/disciplinas` | Cria uma disciplina |
| GET | `/api/v1/disciplinas` | Lista o catálogo de disciplinas |
| POST | `/api/v1/disciplinas/adicionar` | Vincula uma disciplina a um usuário |
| POST | `/api/v1/disciplinas/remover` | Remove uma disciplina de um usuário |
| POST | `/api/v1/slots` | Cria um bloco de slots de 15 minutos |
| GET | `/api/v1/mentores/:mentorId/slots` | Lista os slots de um mentor |
| GET | `/api/v1/mentores/:mentorId/slots/disponiveis` | Lista os slots disponíveis (futuros) de um mentor |
| PUT | `/api/v1/slots/:slotId` | Edita a data/hora e/ou o status de um slot |
| DELETE | `/api/v1/slots/:slotId` | Remove um slot |
| POST | `/api/v1/solicitacoes` | Cria uma solicitação de mentoria |
| GET | `/api/v1/solicitacoes/pendentes/:mentorId` | Lista as solicitações pendentes de um mentor |
| PUT | `/api/v1/solicitacoes` | Aceita ou recusa uma solicitação |
| POST | `/api/v1/sessoes` | Cria uma sessão a partir de uma solicitação aceita |
| GET | `/api/v1/sessoes/:sessaoId` | Obtém os detalhes de uma sessão |
| PUT | `/api/v1/sessoes` | Conclui ou cancela uma sessão |

> O **CORS** está habilitado no servidor Express, permitindo o consumo da API pelo frontend (Vite, em `http://localhost:5173`).

---

## 🔄 Fluxo de Uso

```mermaid
sequenceDiagram
    autonumber
    participant M as Mentor
    participant S as Sistema
    participant A as Mentorado

    M->>S: POST /usuarios (perfil: mentor)
    A->>S: POST /usuarios (perfil: mentorado)
    M->>S: POST /disciplinas (criar disciplina)
    M->>S: POST /disciplinas/adicionar (associar disciplina ao mentor)
    A->>S: POST /disciplinas/adicionar (associar interesse ao mentorado)
    M->>S: POST /slots (criar bloco de slots de 15 min)
    A->>S: GET /usuarios/mentores/:disciplinaId (buscar mentores)
    A->>S: GET /mentores/:mentorId/slots/disponiveis (ver horários livres)
    A->>S: POST /solicitacoes (solicitar mentoria)
    S-->>M: Solicitação pendente disponível
    M->>S: GET /solicitacoes/pendentes/:mentorId (listar pendentes)
    M->>S: PUT /solicitacoes (aceitar)
    S-->>S: Bloqueia os slots (status indisponivel)
    M->>S: POST /sessoes (criar sessão a partir da solicitação aceita)
    alt Sessão concluída
        M->>S: PUT /sessoes (status: concluida)
    else Sessão cancelada
        M->>S: PUT /sessoes (status: cancelada)
        S-->>S: Libera os slots (status disponivel)
    end
```

---

## 📊 Status do Projeto

🚧 **Backend em desenvolvimento** — iniciado em maio de 2026.

- ✅ CRUD de usuários, disciplinas, slots
- ✅ Fluxo completo solicitação → sessão → conclusão
- ✅ Validação de disponibilidade e bloqueio automático de slots
- ✅ Banco de dados SQLite + Prisma (seed com dados de demonstração)
- ⏳ Frontend
- ⏳ Autenticação/autorização
