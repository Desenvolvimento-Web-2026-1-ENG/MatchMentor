import { api } from './api'
import type {
  AtualizarSlotPayload,
  CriarSlotPayload,
  MensagemResposta,
  Slot,
} from '@/types'

export async function criarSlots(payload: CriarSlotPayload): Promise<Slot[]> {
  const { data } = await api.post<Slot[]>('/slots', payload)
  return data
}

export async function listarSlotsDoMentor(mentorId: number): Promise<Slot[]> {
  const { data } = await api.get<Slot[]>(`/mentores/${mentorId}/slots`)
  return data
}

export async function listarSlotsDisponiveis(mentorId: number): Promise<Slot[]> {
  const { data } = await api.get<Slot[]>(`/mentores/${mentorId}/slots/disponiveis`)
  return data
}

export async function editarSlot(
  slotId: number,
  payload: AtualizarSlotPayload,
): Promise<Slot> {
  const { data } = await api.put<Slot>(`/slots/${slotId}`, payload)
  return data
}

export async function removerSlot(slotId: number): Promise<MensagemResposta> {
  const { data } = await api.delete<MensagemResposta>(`/slots/${slotId}`)
  return data
}
