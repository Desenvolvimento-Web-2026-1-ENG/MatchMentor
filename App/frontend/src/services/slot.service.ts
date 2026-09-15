import { MINUTOS_POR_SLOT } from '@/lib/calendario'
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

/** Cria um período de disponibilidade (bloco de slots de 15 minutos). */
export async function criarBloco(
  mentorId: number,
  inicio: Date,
  duracaoMinutos: number,
): Promise<Slot[]> {
  return criarSlots({
    mentorId,
    dataHora: inicio.toISOString(),
    duracaoTotalMinutos: duracaoMinutos,
  })
}

/** Remove todos os slots de um bloco de disponibilidade. */
export async function removerBloco(slotsDoBloco: Slot[]): Promise<void> {
  for (const slot of slotsDoBloco) {
    await removerSlot(slot.id)
  }
}

/**
 * Move e/ou redimensiona um bloco de disponibilidade usando a API de slots.
 * A ordem das chamadas segue as regras do backend (cada slot só pode ser movido
 * para um horário livre e não pode ficar no passado):
 * 1. remove os slots que sobram quando o bloco diminui (libera espaço);
 * 2. move os slots mantidos — do último para o primeiro ao adiar (para não colidir
 *    com os próprios slots) e do primeiro para o último ao antecipar;
 * 3. cria os slots que faltam quando o bloco cresce.
 */
export async function ajustarBloco(
  slotsDoBloco: Slot[],
  novoInicio: Date,
  novaDuracaoMinutos: number,
): Promise<void> {
  const atuais = [...slotsDoBloco].sort(
    (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
  )
  if (atuais.length === 0) return

  const quantidadeNova = Math.round(novaDuracaoMinutos / MINUTOS_POR_SLOT)
  const horarioAlvo = (indice: number) =>
    new Date(novoInicio.getTime() + indice * MINUTOS_POR_SLOT * 60_000)

  const quantidadeMantida = Math.min(quantidadeNova, atuais.length)
  const excedentes = atuais.slice(quantidadeNova)
  const mantidos = atuais.slice(0, quantidadeMantida)
  const quantidadeACriar = quantidadeNova - quantidadeMantida

  for (const slot of excedentes) {
    await removerSlot(slot.id)
  }

  const adiando =
    novoInicio.getTime() >= new Date(atuais[0].dataHora).getTime()
  const indices = mantidos.map((_, indice) => indice)
  if (adiando) indices.reverse()

  for (const indice of indices) {
    const slot = mantidos[indice]
    const destino = horarioAlvo(indice)
    if (new Date(slot.dataHora).getTime() === destino.getTime()) continue
    await editarSlot(slot.id, { dataHora: destino.toISOString() })
  }

  if (quantidadeACriar > 0) {
    await criarSlots({
      mentorId: mantidos[0].mentorId,
      dataHora: horarioAlvo(quantidadeMantida).toISOString(),
      duracaoTotalMinutos: quantidadeACriar * MINUTOS_POR_SLOT,
    })
  }
}
