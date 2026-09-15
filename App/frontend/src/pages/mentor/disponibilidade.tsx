import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Calendar, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarioSemanal } from '@/components/calendario-semanal'
import { useAuth } from '@/contexts/auth-context'
import {
  MINUTOS_POR_DIA,
  MINUTOS_POR_SLOT,
  agruparEmBlocos,
  dataHoraDoMinuto,
  deslocarSemanas,
  diasDaSemana,
  encontrarConflito,
  formatarPeriodoSemana,
  horarioDosMinutos,
  inicioDaSemana,
  minutosDoHorario,
  minutosDesdeMeiaNoite,
} from '@/lib/calendario'
import type { BlocoCalendario, ClassificacaoSlots } from '@/lib/calendario'
import {
  classeBadgeSolicitacao,
  classeBadgeSlot,
  formatarData,
  formatarHora,
  rotuloStatusSolicitacao,
  rotuloStatusSlot,
} from '@/lib/status'
import { listarSessoes } from '@/services/sessao.service'
import { listarSolicitacoesPendentes } from '@/services/solicitacao.service'
import {
  ajustarBloco,
  criarBloco,
  listarSlotsDoMentor,
  removerBloco,
} from '@/services/slot.service'
import type { Sessao, Slot, SolicitacaoPendente } from '@/types'

type ModoDialogo = 'criar' | 'editar' | 'passado' | 'ocupado' | 'pendente'

interface DadosDoSlot {
  nome: string
  disciplina: string
}

function proximaHoraCheia(referencia: Date): Date {
  const alvo = new Date(referencia)
  alvo.setSeconds(0, 0)
  alvo.setMinutes(0)
  alvo.setHours(alvo.getHours() + 1)
  return alvo
}

export function MentorDisponibilidadePage() {
  const { usuario } = useAuth()
  const mentorId = usuario?.id

  const [semanaInicio, setSemanaInicio] = useState(() =>
    inicioDaSemana(new Date()),
  )
  const [agora, setAgora] = useState(() => new Date())
  const [slots, setSlots] = useState<Slot[]>([])
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [pendentes, setPendentes] = useState<SolicitacaoPendente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)

  const [dialogAberto, setDialogAberto] = useState(false)
  const [blocoSelecionado, setBlocoSelecionado] = useState<BlocoCalendario | null>(
    null,
  )
  const [formulario, setFormulario] = useState({ data: '', inicio: '', fim: '' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [blocoParaExcluir, setBlocoParaExcluir] =
    useState<BlocoCalendario | null>(null)
  const [exclusaoAberta, setExclusaoAberta] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    if (mentorId === undefined) return
    const id = mentorId
    let ativo = true

    async function carregarDados() {
      try {
        const [dadosSlots, dadosSessoes, dadosPendentes] = await Promise.all([
          listarSlotsDoMentor(id),
          listarSessoes(id, 'mentor'),
          listarSolicitacoesPendentes(id),
        ])
        if (!ativo) return
        setSlots(dadosSlots)
        setSessoes(dadosSessoes)
        setPendentes(dadosPendentes)
        setAgora(new Date())
      } catch (error) {
        if (!ativo) return
        toast.error(error instanceof Error ? error.message : 'Erro inesperado')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarDados()
    return () => {
      ativo = false
    }
  }, [mentorId, versao])

  const recarregar = () => {
    setVersao((atual) => atual + 1)
  }

  const dias = useMemo(() => diasDaSemana(semanaInicio), [semanaInicio])

  const classificacao = useMemo<ClassificacaoSlots>(() => {
    const ocupados = new Set<number>()
    const comPendencia = new Set<number>()
    for (const sessao of sessoes) {
      if (sessao.status === 'cancelada') continue
      for (const slotId of sessao.slotIds) ocupados.add(slotId)
    }
    for (const solicitacao of pendentes) {
      for (const slotId of solicitacao.slots) comPendencia.add(slotId)
    }
    return { ocupados, pendentes: comPendencia }
  }, [sessoes, pendentes])

  const dadosPorSlot = useMemo(() => {
    const mapa = new Map<number, DadosDoSlot>()
    for (const sessao of sessoes) {
      if (sessao.status === 'cancelada') continue
      for (const slotId of sessao.slotIds) {
        mapa.set(slotId, {
          nome: sessao.mentoradoNome,
          disciplina: sessao.disciplinaNome,
        })
      }
    }
    for (const solicitacao of pendentes) {
      for (const slotId of solicitacao.slots) {
        if (mapa.has(slotId)) continue
        mapa.set(slotId, {
          nome: solicitacao.mentoradoNome,
          disciplina: solicitacao.disciplinaNome,
        })
      }
    }
    return mapa
  }, [sessoes, pendentes])

  const blocos = useMemo(() => {
    return agruparEmBlocos(slots, classificacao).map((bloco) => {
      const dados = dadosPorSlot.get(bloco.slots[0].id)
      return dados ? { ...bloco, detalhe: dados.nome } : bloco
    })
  }, [slots, classificacao, dadosPorSlot])

  const validarPeriodo = (
    inicio: Date,
    fim: Date,
    ignorar: Set<number>,
  ): string | null => {
    if (inicio.getTime() < agora.getTime()) {
      return 'Não é possível criar ou mover períodos para o passado.'
    }
    const conflito = encontrarConflito(inicio, fim, slots, ignorar)
    if (conflito) {
      return classificacao.pendentes.has(conflito.id)
        ? 'Este horário possui uma solicitação pendente. Aceite ou recuse a solicitação para liberá-lo.'
        : 'Já existe um slot nesse horário para este mentor.'
    }
    return null
  }

  const criarPeriodo = async (inicio: Date, fim: Date) => {
    if (mentorId === undefined || processando) return

    const duracaoMinutos = Math.round(
      (fim.getTime() - inicio.getTime()) / 60_000,
    )
    const problema = validarPeriodo(inicio, fim, new Set())
    if (problema) {
      toast.error(problema)
      return
    }

    try {
      setProcessando(true)
      const criados = await criarBloco(mentorId, inicio, duracaoMinutos)
      toast.success(`${criados.length} slots criados com sucesso.`)
      recarregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setProcessando(false)
    }
  }

  const moverBloco = async (bloco: BlocoCalendario, novoInicio: Date) => {
    if (processando) return

    const ignorar = new Set(bloco.slots.map((slot) => slot.id))
    const novoFim = new Date(
      novoInicio.getTime() + bloco.duracaoMinutos * 60_000,
    )
    const problema = validarPeriodo(novoInicio, novoFim, ignorar)
    if (problema) {
      toast.error(problema)
      return
    }

    try {
      setProcessando(true)
      await ajustarBloco(bloco.slots, novoInicio, bloco.duracaoMinutos)
      toast.success('Período atualizado com sucesso.')
      recarregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
      recarregar()
    } finally {
      setProcessando(false)
    }
  }

  const redimensionarBloco = async (
    bloco: BlocoCalendario,
    novoInicio: Date,
    novoFim: Date,
  ) => {
    if (processando) return

    const ignorar = new Set(bloco.slots.map((slot) => slot.id))
    const duracaoMinutos = Math.round(
      (novoFim.getTime() - novoInicio.getTime()) / 60_000,
    )
    const problema = validarPeriodo(novoInicio, novoFim, ignorar)
    if (problema) {
      toast.error(problema)
      return
    }

    try {
      setProcessando(true)
      await ajustarBloco(bloco.slots, novoInicio, duracaoMinutos)
      toast.success('Período atualizado com sucesso.')
      recarregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
      recarregar()
    } finally {
      setProcessando(false)
    }
  }

  const abrirBloco = (bloco: BlocoCalendario) => {
    setBlocoSelecionado(bloco)
    setFormulario({
      data: format(bloco.inicio, 'yyyy-MM-dd'),
      inicio: horarioDosMinutos(minutosDesdeMeiaNoite(bloco.inicio)),
      fim: horarioDosMinutos(
        minutosDesdeMeiaNoite(bloco.inicio) + bloco.duracaoMinutos,
      ),
    })
    setErro('')
    setDialogAberto(true)
  }

  const abrirNovoPeriodo = () => {
    const inicio = proximaHoraCheia(new Date())
    const inicioMinutos = minutosDesdeMeiaNoite(inicio)
    const fimMinutos = Math.min(inicioMinutos + 60, MINUTOS_POR_DIA)

    setBlocoSelecionado(null)
    setFormulario({
      data: format(inicio, 'yyyy-MM-dd'),
      inicio: horarioDosMinutos(inicioMinutos),
      fim: horarioDosMinutos(fimMinutos),
    })
    setErro('')
    setDialogAberto(true)
  }

  const salvarPeriodo = async () => {
    if (mentorId === undefined) return

    const { data, inicio: textoInicio, fim: textoFim } = formulario
    if (!data || !textoInicio || !textoFim) {
      setErro('Preencha a data, o horário de início e o de término.')
      return
    }

    const inicioMinutos = minutosDoHorario(textoInicio)
    const fimInformado = minutosDoHorario(textoFim)
    if (inicioMinutos === null || fimInformado === null) {
      setErro('Horário inválido.')
      return
    }

    // "00:00" no fim representa o encerramento do dia (24:00).
    const fimMinutos =
      fimInformado <= inicioMinutos ? MINUTOS_POR_DIA : fimInformado

    if (
      inicioMinutos % MINUTOS_POR_SLOT !== 0 ||
      fimMinutos % MINUTOS_POR_SLOT !== 0
    ) {
      setErro('Os horários devem ser múltiplos de 15 minutos.')
      return
    }

    const duracaoMinutos = fimMinutos - inicioMinutos
    if (duracaoMinutos < MINUTOS_POR_SLOT) {
      setErro('O período precisa ter pelo menos 15 minutos.')
      return
    }

    const dia = new Date(`${data}T00:00`)
    if (Number.isNaN(dia.getTime())) {
      setErro('Data inválida.')
      return
    }

    const inicio = dataHoraDoMinuto(dia, inicioMinutos)
    const fim = dataHoraDoMinuto(dia, fimMinutos)
    const ignorar = new Set(blocoSelecionado?.slots.map((slot) => slot.id) ?? [])

    const problema = validarPeriodo(inicio, fim, ignorar)
    if (problema) {
      setErro(problema)
      return
    }

    try {
      setSalvando(true)
      if (blocoSelecionado) {
        await ajustarBloco(blocoSelecionado.slots, inicio, duracaoMinutos)
        toast.success('Período atualizado com sucesso.')
      } else {
        const criados = await criarBloco(mentorId, inicio, duracaoMinutos)
        toast.success(`${criados.length} slots criados com sucesso.`)
      }
      setDialogAberto(false)
      recarregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setSalvando(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!blocoParaExcluir) return

    try {
      setExcluindo(true)
      await removerBloco(blocoParaExcluir.slots)
      toast.success('Período removido com sucesso.')
      setExclusaoAberta(false)
      recarregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setExcluindo(false)
    }
  }

  const modoDialogo: ModoDialogo = !blocoSelecionado
    ? 'criar'
    : blocoSelecionado.tipo === 'ocupado'
      ? 'ocupado'
      : blocoSelecionado.tipo === 'pendente'
        ? 'pendente'
        : blocoSelecionado.inicio.getTime() < agora.getTime()
          ? 'passado'
          : 'editar'

  const dadosDoBlocoSelecionado = blocoSelecionado
    ? dadosPorSlot.get(blocoSelecionado.slots[0].id)
    : undefined

  const titulos: Record<ModoDialogo, string> = {
    criar: 'Novo período de disponibilidade',
    editar: 'Editar período',
    passado: 'Período já iniciado',
    ocupado: 'Horário ocupado',
    pendente: 'Horário com solicitação pendente',
  }

  const descricoes: Record<ModoDialogo, string> = {
    criar: 'Defina a data, o horário de início e o de término do período.',
    editar:
      'Ajuste a data, o horário de início e o de término do período de disponibilidade.',
    passado:
      'Este período já começou, portanto só pode ser excluído — o sistema não permite criar disponibilidade no passado.',
    ocupado: 'Este horário está reservado para uma sessão confirmada.',
    pendente:
      'Existe uma solicitação de mentoria aguardando a sua resposta para este horário.',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Minha Disponibilidade
          </h1>
          <p className="text-muted-foreground">
            Clique e arraste no calendário para criar períodos de mentoria
          </p>
        </div>
        <Button onClick={abrirNovoPeriodo} disabled={processando}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Período
        </Button>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b bg-muted/20 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Semana anterior"
              onClick={() => setSemanaInicio((atual) => deslocarSemanas(atual, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setSemanaInicio(inicioDaSemana(new Date()))
                setAgora(new Date())
              }}
            >
              <Calendar className="h-4 w-4 text-primary" />
              Esta semana
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Próxima semana"
              onClick={() => setSemanaInicio((atual) => deslocarSemanas(atual, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-1 text-sm font-medium">
              {formatarPeriodoSemana(semanaInicio)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-primary" />
              Disponível
            </span>
            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-accent" />
              Ocupado
            </span>
            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-warning" />
              Solicitação pendente
            </span>
          </div>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CalendarioSemanal
            dias={dias}
            blocos={blocos}
            agora={agora}
            bloqueado={processando || salvando || excluindo}
            onCriarPeriodo={criarPeriodo}
            onMoverBloco={moverBloco}
            onRedimensionarBloco={redimensionarBloco}
            onAbrirBloco={abrirBloco}
          />
        )}
      </Card>

      {/* Criar / editar / detalhes do período */}
      <Dialog
        open={dialogAberto}
        onOpenChange={(aberto) => {
          setDialogAberto(aberto)
          if (!aberto) setErro('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{titulos[modoDialogo]}</DialogTitle>
            <DialogDescription>{descricoes[modoDialogo]}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {erro && (
              <Alert variant="destructive">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            {modoDialogo === 'passado' && (
              <Alert>
                <AlertDescription>
                  Períodos que já começaram só podem ser excluídos.
                </AlertDescription>
              </Alert>
            )}

            {(modoDialogo === 'ocupado' || modoDialogo === 'pendente') &&
              blocoSelecionado && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Data</p>
                      <p className="font-medium">
                        {formatarData(blocoSelecionado.inicio)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Horário</p>
                      <p className="font-medium">
                        {formatarHora(blocoSelecionado.inicio)} –{' '}
                        {formatarHora(blocoSelecionado.fim)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Mentorado</p>
                      <p className="font-medium">
                        {dadosDoBlocoSelecionado?.nome ?? '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Disciplina</p>
                      <p className="font-medium">
                        {dadosDoBlocoSelecionado?.disciplina ?? '—'}
                      </p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-muted-foreground">Situação</p>
                      {modoDialogo === 'ocupado' ? (
                        <Badge
                          variant="outline"
                          className={classeBadgeSlot.indisponivel}
                        >
                          {rotuloStatusSlot.indisponivel}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={classeBadgeSolicitacao.pendente}
                        >
                          {rotuloStatusSolicitacao.pendente}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {modoDialogo === 'pendente' && (
                    <p className="text-sm text-muted-foreground">
                      Aceite ou recuse a solicitação na tela de Solicitações para
                      liberar este horário.
                    </p>
                  )}
                </div>
              )}

            {(modoDialogo === 'criar' ||
              modoDialogo === 'editar' ||
              modoDialogo === 'passado') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo-data">Data</Label>
                  <Input
                    id="periodo-data"
                    type="date"
                    className="h-11"
                    value={formulario.data}
                    disabled={modoDialogo === 'passado'}
                    onChange={(evento) =>
                      setFormulario((atual) => ({
                        ...atual,
                        data: evento.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodo-inicio">Início</Label>
                    <Input
                      id="periodo-inicio"
                      type="time"
                      step={900}
                      className="h-11"
                      value={formulario.inicio}
                      disabled={modoDialogo === 'passado'}
                      onChange={(evento) =>
                        setFormulario((atual) => ({
                          ...atual,
                          inicio: evento.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodo-fim">Fim</Label>
                    <Input
                      id="periodo-fim"
                      type="time"
                      step={900}
                      className="h-11"
                      value={formulario.fim}
                      disabled={modoDialogo === 'passado'}
                      onChange={(evento) =>
                        setFormulario((atual) => ({
                          ...atual,
                          fim: evento.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Os horários são múltiplos de 15 minutos. Use 00:00 como fim para
                  encerrar o período às 24:00.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            {blocoSelecionado &&
            (modoDialogo === 'editar' || modoDialogo === 'passado') ? (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setDialogAberto(false)
                  setBlocoParaExcluir(blocoSelecionado)
                  setExclusaoAberta(true)
                }}
              >
                Excluir período
              </Button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Fechar
              </Button>
              {(modoDialogo === 'criar' || modoDialogo === 'editar') && (
                <Button onClick={salvarPeriodo} disabled={salvando}>
                  {salvando
                    ? 'Salvando...'
                    : modoDialogo === 'criar'
                      ? 'Criar período'
                      : 'Salvar'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={exclusaoAberta} onOpenChange={setExclusaoAberta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir período?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir
              {blocoParaExcluir
                ? ` o período de ${formatarData(blocoParaExcluir.inicio)} das ${formatarHora(blocoParaExcluir.inicio)} às ${formatarHora(blocoParaExcluir.fim)}`
                : ' este período'}
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} disabled={excluindo}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
