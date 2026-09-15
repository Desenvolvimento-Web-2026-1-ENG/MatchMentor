import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { StatusSessao, StatusSlot, StatusSolicitacao } from '@/types'

/** Rótulos exibidos na interface para cada status (seção 2.4 do roadmap). */
export const rotuloStatusSlot: Record<StatusSlot, string> = {
  disponivel: 'Disponível',
  indisponivel: 'Ocupado',
}

export const rotuloStatusSessao: Record<StatusSessao, string> = {
  agendada: 'Confirmada',
  concluida: 'Realizada',
  cancelada: 'Cancelada',
}

export const rotuloStatusSolicitacao: Record<StatusSolicitacao, string> = {
  pendente: 'Pendente',
  aceita: 'Aceita',
  recusada: 'Recusada',
}

/** Classes de badge (Tailwind) para cada status. */
export const classeBadgeSlot: Record<StatusSlot, string> = {
  disponivel: 'bg-success/10 text-success border-success/30',
  indisponivel: 'bg-accent/20 text-accent-foreground border-accent/30',
}

export const classeBadgeSessao: Record<StatusSessao, string> = {
  agendada: 'bg-success/10 text-success border-success/30',
  concluida: 'bg-info/10 text-info border-info/30',
  cancelada: 'bg-destructive/10 text-destructive border-destructive/30',
}

export const classeBadgeSolicitacao: Record<StatusSolicitacao, string> = {
  pendente: 'bg-warning/10 text-warning border-warning/30',
  aceita: 'bg-success/10 text-success border-success/30',
  recusada: 'bg-destructive/10 text-destructive border-destructive/30',
}

type ValorData = string | Date

/** 20/09/2026 14:30 */
export function formatarDataHora(valor: ValorData): string {
  return format(new Date(valor), 'dd/MM/yyyy HH:mm')
}

/** 20/09/2026 */
export function formatarData(valor: ValorData): string {
  return format(new Date(valor), 'dd/MM/yyyy')
}

/** 14:30 */
export function formatarHora(valor: ValorData): string {
  return format(new Date(valor), 'HH:mm')
}

/** Horário de término a partir da duração: 15:30 */
export function formatarFim(valor: ValorData, duracaoMinutos: number): string {
  return formatarHora(new Date(new Date(valor).getTime() + duracaoMinutos * 60_000))
}

/** Cabeçalho de agrupamento por dia: "Sexta-feira, 20 de setembro" */
export function formatarDia(valor: ValorData): string {
  const texto = format(new Date(valor), "EEEE, dd 'de' MMMM", { locale: ptBR })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Chave estável (yyyy-MM-dd) para agrupar registros por dia. */
export function chaveDia(valor: ValorData): string {
  return format(new Date(valor), 'yyyy-MM-dd')
}
