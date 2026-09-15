# 📸 Screenshots das telas

Imagens usadas no [Guia de Telas](../../README.md#guia-de-telas) do README.

| Arquivo | Tela | Rota |
|---------|------|------|
| `01-login.png` | Login (seletor de usuários) | `/login` |
| `02-cadastro.png` | Cadastro | `/cadastro` |
| `03-dashboard-mentor.png` | Painel do Mentor | `/mentor` |
| `04-disponibilidade.png` | Calendário de disponibilidade | `/mentor/disponibilidade` |
| `05-solicitacoes.png` | Solicitações recebidas | `/mentor/solicitacoes` |
| `06-dashboard-mentorado.png` | Painel do Mentorado | `/mentorado` |
| `07-buscar-mentores.png` | Buscar mentores | `/mentorado/buscar` |
| `08-perfil-mentor.png` | Perfil do mentor + solicitação | `/mentores/:mentorId` |
| `09-sessoes.png` | Minhas Sessões | `/sessoes` |
| `10-sessao-detalhes.png` | Detalhes da sessão | `/sessoes/:sessaoId` |

## Como capturar

```bash
# Suba a aplicação e carregue os dados de demonstração
docker compose up --build
docker compose exec backend npx prisma db seed
```

Acesse `http://localhost:8080`, entre pelo seletor de usuários e salve cada tela com os nomes da tabela acima.
