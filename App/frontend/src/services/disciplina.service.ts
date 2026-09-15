import { api } from './api'
import type { CriarDisciplinaPayload, Disciplina, MensagemResposta } from '@/types'

export async function listarDisciplinas(): Promise<Disciplina[]> {
  const { data } = await api.get<Disciplina[]>('/disciplinas')
  return data
}

export async function criarDisciplina(
  payload: CriarDisciplinaPayload,
): Promise<Disciplina> {
  const { data } = await api.post<Disciplina>('/disciplinas', payload)
  return data
}

export async function adicionarDisciplinaAoUsuario(
  usuarioId: number,
  disciplinaId: number,
): Promise<MensagemResposta> {
  const { data } = await api.post<MensagemResposta>('/disciplinas/adicionar', {
    usuarioId,
    disciplinaId,
  })
  return data
}

export async function removerDisciplinaDoUsuario(
  usuarioId: number,
  disciplinaId: number,
): Promise<MensagemResposta> {
  const { data } = await api.post<MensagemResposta>('/disciplinas/remover', {
    usuarioId,
    disciplinaId,
  })
  return data
}

export async function listarDisciplinasDoUsuario(
  usuarioId: number,
): Promise<Disciplina[]> {
  const { data } = await api.get<Disciplina[]>(`/usuarios/${usuarioId}/disciplinas`)
  return data
}
