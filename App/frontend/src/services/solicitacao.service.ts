import { api } from './api'
import type { CriarSolicitacaoPayload, Solicitacao, SolicitacaoPendente } from '@/types'

export async function criarSolicitacao(
  payload: CriarSolicitacaoPayload,
): Promise<Solicitacao> {
  const { data } = await api.post<Solicitacao>('/solicitacoes', payload)
  return data
}

export async function listarSolicitacoesPendentes(
  mentorId: number,
): Promise<SolicitacaoPendente[]> {
  const { data } = await api.get<SolicitacaoPendente[]>(
    `/solicitacoes/pendentes/${mentorId}`,
  )
  return data
}

export async function atualizarSolicitacao(
  solicitacaoId: number,
  status: 'aceita' | 'recusada',
): Promise<SolicitacaoPendente> {
  const { data } = await api.put<SolicitacaoPendente>('/solicitacoes', {
    solicitacaoId,
    status,
  })
  return data
}
