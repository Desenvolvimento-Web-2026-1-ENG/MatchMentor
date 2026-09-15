import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as EventoPointerReact } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MINUTOS_POR_DIA,
  MINUTOS_POR_SLOT,
  dataHoraDoMinuto,
  encaixarEm15Minutos,
  minutosDesdeMeiaNoite,
  rotuloDia,
} from '@/lib/calendario'
import type { BlocoCalendario } from '@/lib/calendario'
import { chaveDia, formatarFim, formatarHora } from '@/lib/status'

const MINUTOS_POR_HORA = 60
const PX_POR_MINUTO = 20 / MINUTOS_POR_SLOT
const ALTURA_DIA = MINUTOS_POR_DIA * PX_POR_MINUTO
const ALTURA_MINIMA_BLOCO = 16
const DISTANCIA_MINIMA_ARRASTE = 4
const HORAS = Array.from({ length: 24 }, (_, hora) => hora)

const FUNDO_GRADE: CSSProperties = {
  backgroundImage: [
    `repeating-linear-gradient(to bottom, var(--border) 0px, var(--border) 1px, transparent 1px, transparent ${PX_POR_MINUTO * MINUTOS_POR_HORA}px)`,
    `repeating-linear-gradient(to bottom, color-mix(in oklab, var(--border) 45%, transparent) 0px, color-mix(in oklab, var(--border) 45%, transparent) 1px, transparent 1px, transparent ${PX_POR_MINUTO * MINUTOS_POR_SLOT}px)`,
  ].join(', '),
}

interface Previa {
  dia: Date
  inicioMin: number
  fimMin: number
}

interface Sessao {
  modo: 'selecao' | 'mover' | 'redimensionar'
  bloco?: BlocoCalendario
  borda?: 'topo' | 'base'
  /** Minuto de referência absoluto (início do bloco ou âncora da seleção). */
  ancoraMin: number
  /** Distância, em minutos, entre o ponteiro e o início do bloco (modo mover). */
  deslocamentoMin: number
  dia: Date
  origemX: number
  origemY: number
}

interface CalendarioSemanalProps {
  dias: Date[]
  blocos: BlocoCalendario[]
  agora: Date
  bloqueado?: boolean
  onCriarPeriodo: (inicio: Date, fim: Date) => void
  onMoverBloco: (bloco: BlocoCalendario, novoInicio: Date) => void
  onRedimensionarBloco: (
    bloco: BlocoCalendario,
    novoInicio: Date,
    novoFim: Date,
  ) => void
  onAbrirBloco: (bloco: BlocoCalendario) => void
}

export function CalendarioSemanal({
  dias,
  blocos,
  agora,
  bloqueado = false,
  onCriarPeriodo,
  onMoverBloco,
  onRedimensionarBloco,
  onAbrirBloco,
}: CalendarioSemanalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const gradeRef = useRef<HTMLDivElement>(null)
  const sessaoRef = useRef<Sessao | null>(null)
  const previaRef = useRef<Previa | null>(null)
  const moveuRef = useRef(false)
  const rolouRef = useRef(false)
  const semanaRef = useRef<number | null>(null)
  const [previa, setPrevia] = useState<Previa | null>(null)

  const definirPrevia = (valor: Previa | null) => {
    previaRef.current = valor
    setPrevia(valor)
  }

  const chavesVisiveis = new Set(dias.map((dia) => chaveDia(dia)))
  const blocosVisiveis = blocos.filter((bloco) =>
    chavesVisiveis.has(chaveDia(bloco.inicio)),
  )

  // Rola o calendário para o primeiro período da semana (ou para as 07:00).
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const chaveSemana = dias[0]?.getTime() ?? 0
    const mudouSemana = semanaRef.current !== chaveSemana
    const primeiraRolagem = !rolouRef.current && blocosVisiveis.length > 0
    if (!mudouSemana && !primeiraRolagem) return

    semanaRef.current = chaveSemana
    rolouRef.current = true

    const inicioMaisCedo =
      blocosVisiveis.length > 0
        ? Math.min(
            ...blocosVisiveis.map((bloco) => minutosDesdeMeiaNoite(bloco.inicio)),
          )
        : null
    const alvoMinutos =
      inicioMaisCedo !== null && inicioMaisCedo > 0
        ? inicioMaisCedo
        : 7 * MINUTOS_POR_HORA

    container.scrollTop = Math.max(0, alvoMinutos * PX_POR_MINUTO - 32)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dias, blocosVisiveis.length])

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return
      sessaoRef.current = null
      definirPrevia(null)
    }

    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [])

  const posicionarDoEvento = (
    evento: EventoPointerReact<HTMLElement> | PointerEvent,
  ): { dia: Date; minutos: number } | null => {
    const grade = gradeRef.current
    if (!grade) return null

    const retangulo = grade.getBoundingClientRect()
    const larguraColuna = retangulo.width / dias.length
    const indice = Math.min(
      dias.length - 1,
      Math.max(0, Math.floor((evento.clientX - retangulo.left) / larguraColuna)),
    )
    const minutos = Math.min(
      MINUTOS_POR_DIA,
      Math.max(0, (evento.clientY - retangulo.top) / PX_POR_MINUTO),
    )

    return { dia: dias[indice], minutos }
  }

  const iniciarSelecao = (
    evento: EventoPointerReact<HTMLDivElement>,
    dia: Date,
  ) => {
    if (bloqueado || evento.button !== 0) return

    const posicao = posicionarDoEvento(evento)
    if (!posicao) return

    const minutoBase = Math.min(
      Math.max(encaixarEm15Minutos(posicao.minutos), 0),
      MINUTOS_POR_DIA - MINUTOS_POR_SLOT,
    )
    if (dataHoraDoMinuto(dia, minutoBase).getTime() < agora.getTime()) return

    evento.currentTarget.setPointerCapture(evento.pointerId)
    sessaoRef.current = {
      modo: 'selecao',
      ancoraMin: minutoBase,
      deslocamentoMin: 0,
      dia,
      origemX: evento.clientX,
      origemY: evento.clientY,
    }
    moveuRef.current = false
    definirPrevia({ dia, inicioMin: minutoBase, fimMin: minutoBase + MINUTOS_POR_SLOT })
  }

  const iniciarBloco = (
    evento: EventoPointerReact<HTMLDivElement>,
    bloco: BlocoCalendario,
  ) => {
    if (bloqueado || evento.button !== 0) return
    evento.stopPropagation()

    // Qualquer clique simples abre o diálogo; só um arrasto consome o clique.
    moveuRef.current = false

    const interativo =
      bloco.tipo === 'disponivel' && bloco.inicio.getTime() >= agora.getTime()
    if (!interativo) return

    const posicao = posicionarDoEvento(evento)
    if (!posicao) return

    const alca = (evento.target as HTMLElement)
      .closest('[data-alca]')
      ?.getAttribute('data-alca')
    const borda = alca === 'topo' || alca === 'base' ? alca : undefined

    evento.currentTarget.setPointerCapture(evento.pointerId)
    sessaoRef.current = {
      modo: borda ? 'redimensionar' : 'mover',
      bloco,
      borda,
      ancoraMin: minutosDesdeMeiaNoite(bloco.inicio),
      deslocamentoMin: posicao.minutos - minutosDesdeMeiaNoite(bloco.inicio),
      dia: bloco.inicio,
      origemX: evento.clientX,
      origemY: evento.clientY,
    }
    moveuRef.current = false
  }

  const atualizarInteracao = (evento: EventoPointerReact<HTMLDivElement>) => {
    const sessao = sessaoRef.current
    if (!sessao) return

    const posicao = posicionarDoEvento(evento)
    if (!posicao) return

    if (
      !moveuRef.current &&
      Math.abs(evento.clientX - sessao.origemX) +
        Math.abs(evento.clientY - sessao.origemY) >
        DISTANCIA_MINIMA_ARRASTE
    ) {
      moveuRef.current = true
    }

    if (sessao.modo === 'selecao') {
      const ponto = encaixarEm15Minutos(posicao.minutos)
      const inicio = Math.min(
        Math.max(Math.min(sessao.ancoraMin, ponto), 0),
        MINUTOS_POR_DIA - MINUTOS_POR_SLOT,
      )
      const fim = Math.min(
        Math.max(Math.max(sessao.ancoraMin, ponto), inicio + MINUTOS_POR_SLOT),
        MINUTOS_POR_DIA,
      )
      definirPrevia({ dia: sessao.dia, inicioMin: inicio, fimMin: fim })
      return
    }

    const duracaoMinutos = sessao.bloco?.duracaoMinutos ?? MINUTOS_POR_SLOT

    if (sessao.modo === 'mover') {
      const inicio = Math.min(
        Math.max(
          encaixarEm15Minutos(posicao.minutos - sessao.deslocamentoMin),
          0,
        ),
        MINUTOS_POR_DIA - duracaoMinutos,
      )
      definirPrevia({
        dia: posicao.dia,
        inicioMin: inicio,
        fimMin: inicio + duracaoMinutos,
      })
      return
    }

    const fimAtual = sessao.ancoraMin + duracaoMinutos
    if (sessao.borda === 'topo') {
      const inicio = Math.min(
        Math.max(encaixarEm15Minutos(posicao.minutos), 0),
        fimAtual - MINUTOS_POR_SLOT,
      )
      definirPrevia({ dia: sessao.dia, inicioMin: inicio, fimMin: fimAtual })
    } else {
      const fim = Math.min(
        Math.max(
          encaixarEm15Minutos(posicao.minutos),
          sessao.ancoraMin + MINUTOS_POR_SLOT,
        ),
        MINUTOS_POR_DIA,
      )
      definirPrevia({ dia: sessao.dia, inicioMin: sessao.ancoraMin, fimMin: fim })
    }
  }

  const finalizarInteracao = () => {
    const sessao = sessaoRef.current
    const previaAtual = previaRef.current
    sessaoRef.current = null
    definirPrevia(null)

    if (!sessao || !previaAtual) return

    const inicio = dataHoraDoMinuto(previaAtual.dia, previaAtual.inicioMin)
    const fim = dataHoraDoMinuto(previaAtual.dia, previaAtual.fimMin)

    if (sessao.modo === 'selecao') {
      onCriarPeriodo(inicio, fim)
      return
    }
    if (!sessao.bloco || !moveuRef.current) return

    if (sessao.modo === 'mover') {
      onMoverBloco(sessao.bloco, inicio)
    } else {
      onRedimensionarBloco(sessao.bloco, inicio, fim)
    }
  }

  const cancelarInteracao = () => {
    sessaoRef.current = null
    definirPrevia(null)
  }

  const hojeChave = chaveDia(agora)

  return (
    <div>
      <div ref={scrollRef} className="max-h-[620px] overflow-auto">
        <div className="min-w-[900px] select-none">
          {/* Cabeçalho dos dias */}
          <div className="sticky top-0 z-30 flex border-b bg-card">
            <div className="w-16 shrink-0 border-r border-border" />
            <div className="grid flex-1 grid-cols-7">
              {dias.map((dia) => (
                <div
                  key={chaveDia(dia)}
                  className={cn(
                    'border-l border-border px-2 py-2 text-center text-xs font-medium text-muted-foreground',
                    chaveDia(dia) === hojeChave &&
                      'bg-primary/5 font-semibold text-primary',
                  )}
                >
                  {rotuloDia(dia)}
                </div>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div className="flex">
            <div
              className="relative w-16 shrink-0 border-r border-border bg-card"
              style={{ height: ALTURA_DIA }}
            >
              {HORAS.map((hora) => (
                <span
                  key={hora}
                  className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                  style={{ top: hora * MINUTOS_POR_HORA * PX_POR_MINUTO }}
                >
                  {String(hora).padStart(2, '0')}:00
                </span>
              ))}
            </div>

            <div
              ref={gradeRef}
              className="grid flex-1 grid-cols-7"
              style={{ height: ALTURA_DIA }}
            >
              {dias.map((dia) => (
                <div
                  key={chaveDia(dia)}
                  data-dia={chaveDia(dia)}
                  className={cn(
                    'relative cursor-crosshair border-l border-border',
                    chaveDia(dia) === hojeChave && 'bg-primary/5',
                  )}
                  style={FUNDO_GRADE}
                  onPointerDown={(evento) => iniciarSelecao(evento, dia)}
                  onPointerMove={atualizarInteracao}
                  onPointerUp={finalizarInteracao}
                  onPointerCancel={cancelarInteracao}
                >
                  {blocosVisiveis
                    .filter((bloco) => chaveDia(bloco.inicio) === chaveDia(dia))
                    .map((bloco) => {
                      const interativo =
                        bloco.tipo === 'disponivel' &&
                        bloco.inicio.getTime() >= agora.getTime()
                      const altura = Math.max(
                        bloco.duracaoMinutos * PX_POR_MINUTO - 2,
                        ALTURA_MINIMA_BLOCO,
                      )
                      const horario = `${formatarHora(bloco.inicio)} – ${formatarFim(bloco.inicio, bloco.duracaoMinutos)}`
                      const titulo =
                        bloco.tipo === 'disponivel'
                          ? 'Disponível'
                          : (bloco.detalhe ??
                            (bloco.tipo === 'ocupado'
                              ? 'Ocupado'
                              : 'Solicitação pendente'))

                      return (
                        <div
                          key={bloco.chave}
                          role="button"
                          tabIndex={0}
                          title={`${titulo} · ${horario}`}
                          aria-label={`${titulo}, ${horario}`}
                          className={cn(
                            'absolute inset-x-0.5 z-10 flex flex-col overflow-hidden rounded-md border px-1.5 py-1 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            bloco.tipo === 'disponivel' &&
                              interativo &&
                              'border-primary/40 bg-primary/15 hover:bg-primary/25 cursor-grab active:cursor-grabbing',
                            bloco.tipo === 'disponivel' &&
                              !interativo &&
                              'border-border bg-muted/60 text-muted-foreground',
                            bloco.tipo === 'ocupado' &&
                              'border-accent/50 bg-accent/25',
                            bloco.tipo === 'pendente' &&
                              'border-dashed border-warning/60 bg-warning/10',
                          )}
                          style={{ top: minutosDesdeMeiaNoite(bloco.inicio) * PX_POR_MINUTO, height: altura }}
                          onPointerDown={(evento) => iniciarBloco(evento, bloco)}
                          onPointerMove={atualizarInteracao}
                          onPointerUp={finalizarInteracao}
                          onPointerCancel={cancelarInteracao}
                          onClick={() => {
                            if (moveuRef.current) return
                            onAbrirBloco(bloco)
                          }}
                          onKeyDown={(evento) => {
                            if (evento.key !== 'Enter' && evento.key !== ' ') return
                            evento.preventDefault()
                            onAbrirBloco(bloco)
                          }}
                        >
                          {interativo && (
                            <span
                              data-alca="topo"
                              className="absolute inset-x-0 top-0 z-20 h-1.5 cursor-ns-resize"
                            />
                          )}

                          {altura >= 44 && (
                            <span className="flex min-w-0 items-center gap-1">
                              {interativo && (
                                <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
                              )}
                              <span className="truncate text-[11px] leading-tight font-semibold">
                                {titulo}
                              </span>
                            </span>
                          )}
                          {altura >= 30 && (
                            <span className="truncate text-[10px] leading-tight text-muted-foreground">
                              {horario}
                            </span>
                          )}

                          {interativo && (
                            <span
                              data-alca="base"
                              className="absolute inset-x-0 bottom-0 z-20 h-1.5 cursor-ns-resize"
                            />
                          )}
                        </div>
                      )
                    })}

                  {previa && chaveDia(previa.dia) === chaveDia(dia) && (
                    <div
                      className="pointer-events-none absolute inset-x-0.5 z-20 rounded-md border-2 border-dashed border-primary/70 bg-primary/20 px-1.5 py-0.5"
                      style={{
                        top: previa.inicioMin * PX_POR_MINUTO,
                        height: Math.max(
                          (previa.fimMin - previa.inicioMin) * PX_POR_MINUTO,
                          ALTURA_MINIMA_BLOCO,
                        ),
                      }}
                    >
                      <span className="block truncate text-[10px] leading-tight font-medium text-primary">
                        {formatarHora(dataHoraDoMinuto(previa.dia, previa.inicioMin))} –{' '}
                        {formatarHora(dataHoraDoMinuto(previa.dia, previa.fimMin))}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
        Clique (15 min) ou clique e arraste para criar um período. Arraste um período
        para movê-lo e arraste as extremidades para ajustar início e fim.
      </div>
    </div>
  )
}
