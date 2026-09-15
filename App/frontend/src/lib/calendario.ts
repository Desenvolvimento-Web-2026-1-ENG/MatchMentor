import { addDays, addWeeks, format, startOfDay, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Slot } from '@/types'

/** Cada slot da API representa 15 minutos de disponibilidade. */
export const MINUTOS_POR_SLOT = 15
export const MINUTOS_POR_DIA = 24 * 60

export type TipoBloco = 'disponivel' | 'ocupado' | 'pendente'

export interface BlocoCalendario {
  chave: string
  tipo: TipoBloco
  slots: Slot[]
  inicio: Date
  fim: Date
  duracaoMinutos: number
  /** Nome do mentorado (blocos ocupados ou com solicitação pendente). */
  detalhe?: string
}

export interface ClassificacaoSlots {
  ocupados: Set<number>
  pendentes: Set<number>
}

/** Segunda-feira às 00:00 da semana da data informada. */
export function inicioDaSemana(data: Date): Date {
  return startOfWeek(data, { weekStartsOn: 1 })
}

/** Os sete dias (segunda a domingo) a partir do início da semana. */
export function diasDaSemana(inicio: Date): Date[] {
  return Array.from({ length: 7 }, (_, indice) => addDays(inicio, indice))
}

export function deslocarSemanas(inicio: Date, quantidade: number): Date {
  return addWeeks(inicio, quantidade)
}

/** "15 – 21 de setembro de 2026" (ou com os dois meses quando a semana vira). */
export function formatarPeriodoSemana(inicio: Date): string {
  const fim = addDays(inicio, 6)
  const mesmoMes = format(inicio, 'MM/yyyy') === format(fim, 'MM/yyyy')
  if (mesmoMes) {
    return `${format(inicio, 'd')} – ${format(fim, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
  }

  const mesmoAno = format(inicio, 'yyyy') === format(fim, 'yyyy')
  const inicioTexto = format(
    inicio,
    mesmoAno ? "d 'de' MMMM" : "d 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  )
  return `${inicioTexto} – ${format(fim, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
}

/** "SEG 15/09" */
export function rotuloDia(data: Date): string {
  const diaSemana = format(data, 'EEE', { locale: ptBR })
    .replace('.', '')
    .toUpperCase()
  return `${diaSemana} ${format(data, 'dd/MM')}`
}

export function minutosDesdeMeiaNoite(data: Date): number {
  return data.getHours() * 60 + data.getMinutes()
}

export function dataHoraDoMinuto(dia: Date, minutos: number): Date {
  return new Date(startOfDay(dia).getTime() + minutos * 60_000)
}

export function encaixarEm15Minutos(minutos: number): number {
  return Math.round(minutos / MINUTOS_POR_SLOT) * MINUTOS_POR_SLOT
}

/** Converte "09:30" em 570 minutos desde a meia-noite. */
export function minutosDoHorario(valor: string): number | null {
  const [horas, minutos] = valor.split(':').map(Number)
  if (Number.isNaN(horas) || Number.isNaN(minutos)) return null
  return horas * 60 + minutos
}

/** Converte 570 minutos em "09:30" (1440 vira "00:00", o fim do dia). */
export function horarioDosMinutos(minutos: number): string {
  const normalizado = minutos >= MINUTOS_POR_DIA ? 0 : minutos
  const horas = Math.floor(normalizado / 60)
  const resto = normalizado % 60
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

function tipoDoSlot(slot: Slot, classificacao: ClassificacaoSlots): TipoBloco {
  if (classificacao.ocupados.has(slot.id)) return 'ocupado'
  if (classificacao.pendentes.has(slot.id)) return 'pendente'
  return 'disponivel'
}

function fimDoSlot(slot: Slot): Date {
  return new Date(
    new Date(slot.dataHora).getTime() + slot.duracaoMinutos * 60_000,
  )
}

/**
 * Agrupa os slots em blocos visuais: sequências contíguas (de 15 em 15 minutos)
 * do mesmo dia e do mesmo tipo (disponível, ocupado ou com solicitação pendente).
 */
export function agruparEmBlocos(
  slots: Slot[],
  classificacao: ClassificacaoSlots,
): BlocoCalendario[] {
  const ordenados = [...slots].sort(
    (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
  )

  const blocos: BlocoCalendario[] = []

  for (const slot of ordenados) {
    const tipo = tipoDoSlot(slot, classificacao)
    const inicio = new Date(slot.dataHora)
    const fim = fimDoSlot(slot)
    const ultimo = blocos[blocos.length - 1]

    const contiguo =
      ultimo !== undefined &&
      ultimo.tipo === tipo &&
      ultimo.fim.getTime() === inicio.getTime() &&
      format(ultimo.inicio, 'yyyy-MM-dd') === format(inicio, 'yyyy-MM-dd')

    if (contiguo) {
      ultimo.slots.push(slot)
      ultimo.fim = fim
      ultimo.duracaoMinutos = Math.round(
        (fim.getTime() - ultimo.inicio.getTime()) / 60_000,
      )
    } else {
      blocos.push({
        chave: `${slot.id}`,
        tipo,
        slots: [slot],
        inicio,
        fim,
        duracaoMinutos: slot.duracaoMinutos,
      })
    }
  }

  return blocos
}

/** Primeiro slot que se sobrepõe ao intervalo informado (ignorando os IDs indicados). */
export function encontrarConflito(
  inicio: Date,
  fim: Date,
  slots: Slot[],
  ignorar: Set<number>,
): Slot | undefined {
  return slots.find((slot) => {
    if (ignorar.has(slot.id)) return false
    const inicioSlot = new Date(slot.dataHora)
    const fimSlot = fimDoSlot(slot)
    return (
      inicio.getTime() < fimSlot.getTime() &&
      inicioSlot.getTime() < fim.getTime()
    )
  })
}
