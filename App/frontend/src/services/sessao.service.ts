import { api } from './api'
import type {
  Perfil,
  Sessao,
  SessaoCriada,
  SessaoDetalhes,
  SolicitacaoPendente,
} from '@/types'

export async function criarSessao(
  payload: SolicitacaoPendente,
): Promise<SessaoCriada> {
  const { data } = await api.post<SessaoCriada>('/sessoes', payload)
  return data
}

export async function listarSessoes(
  usuarioId: number,
  perfil: Perfil,
): Promise<Sessao[]> {
  const { data } = await api.get<Sessao[]>(`/usuarios/${usuarioId}/sessoes/${perfil}`)
  return data
}

export async function detalhesSessao(sessaoId: number): Promise<SessaoDetalhes> {
  const { data } = await api.get<SessaoDetalhes>(`/sessoes/${sessaoId}`)
  return data
}

export async function atualizarStatusSessao(
  id: number,
  status: 'concluida' | 'cancelada',
): Promise<Sessao> {
  const { data } = await api.put<Sessao>('/sessoes', { id, status })
  return data
}
