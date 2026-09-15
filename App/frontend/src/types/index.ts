export type Perfil = 'mentor' | 'mentorado'

export type StatusSlot = 'disponivel' | 'indisponivel'

export type StatusSolicitacao = 'pendente' | 'aceita' | 'recusada'

export type StatusSessao = 'agendada' | 'concluida' | 'cancelada'

export interface DisciplinaResumo {
  id: number
  nome: string
}

export interface Disciplina {
  id: number
  nome: string
  descricao: string
}

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: Perfil
  disciplinas: DisciplinaResumo[]
}

export interface UsuarioCadastrado {
  id: number
  nome: string
  email: string
  perfil: Perfil
  disciplinas: Disciplina[]
}

export interface Slot {
  id: number
  mentorId: number
  disciplinaId: number
  dataHora: string
  duracaoMinutos: number
  status: StatusSlot
}

export interface Solicitacao {
  id: number
  mentorId: number
  mentoradoId: number
  disciplinaId: number
  dataHora: string
  duracaoMinutos: number
  status: StatusSolicitacao
  slots: number[]
}

export interface SolicitacaoPendente {
  solicitacaoId: number
  mentorId: number
  mentoradoId: number
  disciplinaId: number
  dataHora: string
  duracaoMinutos: number
  status: StatusSolicitacao
  slots: number[]
  mentoradoNome: string
  disciplinaNome: string
}

export interface Sessao {
  id: number
  mentorId: number
  mentoradoId: number
  disciplinaId: number
  dataHora: string
  duracaoMinutos: number
  status: StatusSessao
  mentorNome: string
  mentoradoNome: string
  disciplinaNome: string
  slotIds: number[]
}

export interface SessaoDetalhes {
  id: number
  mentorId: number
  mentoradoId: number
  disciplinaId: number
  dataHora: string
  duracaoMinutos: number
  linkReuniao: string
  feedbackMentorado?: string
  status: StatusSessao
  mentorNome: string
  mentoradoNome: string
  disciplinaNome: string
}

export interface SessaoCriada {
  id: number
  mentorId: number
  mentoradoId: number
  disciplinaId: number
  dataHora: string
  duracaoMinutos: number
  linkReuniao: string
  feedbackMentorado?: string
  status: StatusSessao
  slots: number[]
}

export interface CriarUsuarioPayload {
  nome: string
  email: string
  senha: string
  perfil: Perfil
}

export interface CriarDisciplinaPayload {
  nome: string
  descricao: string
}

export interface CriarSlotPayload {
  mentorId: number
  dataHora: string
  duracaoTotalMinutos: number
}

export interface AtualizarSlotPayload {
  dataHora?: string
  status?: StatusSlot
}

export interface CriarSolicitacaoPayload {
  mentorId: number
  mentoradoId: number
  disciplinaId: number
  dataHora: string
  duracaoMinutos: number
}

export interface MensagemResposta {
  message: string
}
