import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarioSemanal } from '@/components/calendario-semanal'
import { useAuth } from '@/contexts/auth-context'
import {
  MINUTOS_POR_DIA,
  MINUTOS_POR_SLOT,
  agruparEmBlocos,
  dataHoraDoMinuto,
  deslocarSemanas,
  diasDaSemana,
  formatarPeriodoSemana,
  horarioDosMinutos,
  inicioDaSemana,
  minutosDoHorario,
  minutosDesdeMeiaNoite,
} from '@/lib/calendario'
import type { BlocoCalendario } from '@/lib/calendario'
import {
  classeBadgeSolicitacao,
  formatarData,
  formatarFim,
  formatarHora,
  rotuloStatusSolicitacao,
} from '@/lib/status'
import { listarDisciplinasDoUsuario } from '@/services/disciplina.service'
import {
  criarSolicitacao,
  listarSolicitacoesPendentes,
} from '@/services/solicitacao.service'
import { listarSlotsDisponiveis } from '@/services/slot.service'
import { buscarUsuario } from '@/services/usuario.service'
import type { Disciplina, Slot, SolicitacaoPendente, Usuario } from '@/types'

function iniciais(nome: string) {
  return nome
    .split(' ')
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function rotuloHora(minutos: number) {
  return minutos === MINUTOS_POR_DIA ? '24:00' : horarioDosMinutos(minutos)
}

export function MentorProfilePage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { mentorId } = useParams()
  const idMentor = Number(mentorId)
  const mentoradoId = usuario?.id

  const [mentor, setMentor] = useState<Usuario | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [interesses, setInteresses] = useState<Disciplina[]>([])
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPendente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroPagina, setErroPagina] = useState('')
  const [versao, setVersao] = useState(0)
  const [agora, setAgora] = useState(() => new Date())
  const [semanaInicio, setSemanaInicio] = useState(() =>
    inicioDaSemana(new Date()),
  )

  const [dialogAberto, setDialogAberto] = useState(false)
  const [blocoSelecionado, setBlocoSelecionado] = useState<BlocoCalendario | null>(
    null,
  )
  const [formulario, setFormulario] = useState({ data: '', inicio: '', fim: '' })
  const [disciplinaId, setDisciplinaId] = useState('')
  const [erroDialogo, setErroDialogo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] =
    useState<SolicitacaoPendente | null>(null)

  useEffect(() => {
    if (!Number.isFinite(idMentor)) return
    let ativo = true

    async function carregarDados() {
      try {
        const [dadosMentor, dadosSlots, dadosInteresses, dadosSolicitacoes] =
          await Promise.all([
            buscarUsuario(idMentor),
            listarSlotsDisponiveis(idMentor),
            mentoradoId !== undefined
              ? listarDisciplinasDoUsuario(mentoradoId)
              : Promise.resolve<Disciplina[]>([]),
            listarSolicitacoesPendentes(idMentor),
          ])
        if (!ativo) return
        setMentor(dadosMentor)
        setSlots(dadosSlots)
        setInteresses(dadosInteresses)
        // Interessa ao mentorado apenas as solicitações dele mesmo.
        setSolicitacoes(
          dadosSolicitacoes.filter(
            (solicitacao) => solicitacao.mentoradoId === mentoradoId,
          ),
        )
        setErroPagina('')
        setAgora(new Date())
      } catch (error) {
        if (!ativo) return
        setErroPagina(error instanceof Error ? error.message : 'Erro inesperado')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarDados()
    return () => {
      ativo = false
    }
  }, [idMentor, mentoradoId, versao])

  const dias = useMemo(() => diasDaSemana(semanaInicio), [semanaInicio])

  // Os horários com solicitação pendente deste mentorado viram blocos âmbar.
  const pendentesIds = useMemo(
    () => new Set(solicitacoes.flatMap((solicitacao) => solicitacao.slots)),
    [solicitacoes],
  )

  // A API devolve somente slots futuros e disponíveis.
  const blocos = useMemo(
    () =>
      agruparEmBlocos(slots, {
        ocupados: new Set<number>(),
        pendentes: pendentesIds,
      }),
    [slots, pendentesIds],
  )

  const disciplinasDoMentor = mentor?.disciplinas ?? []

  const abrirSolicitacao = (
    bloco: BlocoCalendario,
    inicio?: Date,
    fim?: Date,
  ) => {
    // Bloco com solicitação pendente: mostra os detalhes do pedido já enviado.
    if (bloco.tipo === 'pendente') {
      const solicitacao =
        solicitacoes.find((item) =>
          item.slots.includes(bloco.slots[0].id),
        ) ?? null
      setSolicitacaoSelecionada(solicitacao)
      return
    }

    const inicioEscolhido = inicio ?? bloco.inicio
    const fimEscolhido = fim ?? bloco.fim
    const intersecao = disciplinasDoMentor.filter((disciplina) =>
      interesses.some((interesse) => interesse.id === disciplina.id),
    )
    const padrao = intersecao[0] ?? disciplinasDoMentor[0]

    setBlocoSelecionado(bloco)
    setFormulario({
      data: format(bloco.inicio, 'yyyy-MM-dd'),
      inicio: horarioDosMinutos(minutosDesdeMeiaNoite(inicioEscolhido)),
      fim: horarioDosMinutos(minutosDesdeMeiaNoite(fimEscolhido)),
    })
    setDisciplinaId(padrao ? String(padrao.id) : '')
    setErroDialogo('')
    setDialogAberto(true)
  }

  const enviarSolicitacao = async () => {
    if (!blocoSelecionado || mentoradoId === undefined) return

    const inicioBloco = minutosDesdeMeiaNoite(blocoSelecionado.inicio)
    const fimBloco = inicioBloco + blocoSelecionado.duracaoMinutos

    const inicioMin = minutosDoHorario(formulario.inicio)
    const fimInformado = minutosDoHorario(formulario.fim)
    if (inicioMin === null || fimInformado === null) {
      setErroDialogo('Informe o horário de início e o de término.')
      return
    }

    // "00:00" representa o fim do dia (24:00).
    const fimMin = fimInformado <= inicioMin ? MINUTOS_POR_DIA : fimInformado

    if (inicioMin < inicioBloco || fimMin > fimBloco) {
      setErroDialogo(
        `Escolha um horário entre ${rotuloHora(inicioBloco)} e ${rotuloHora(fimBloco)}, que é o período disponibilizado pelo mentor.`,
      )
      return
    }

    if (
      inicioMin % MINUTOS_POR_SLOT !== 0 ||
      fimMin % MINUTOS_POR_SLOT !== 0
    ) {
      setErroDialogo('Os horários devem ser múltiplos de 15 minutos.')
      return
    }

    if (fimMin - inicioMin < MINUTOS_POR_SLOT) {
      setErroDialogo('O período precisa ter pelo menos 15 minutos.')
      return
    }

    if (!disciplinaId) {
      setErroDialogo('Selecione a disciplina da mentoria.')
      return
    }

    const dia = new Date(`${formulario.data}T00:00`)
    if (Number.isNaN(dia.getTime())) {
      setErroDialogo('Data inválida.')
      return
    }

    const inicio = dataHoraDoMinuto(dia, inicioMin)
    if (inicio.getTime() < agora.getTime()) {
      setErroDialogo('Não é possível solicitar um horário que já passou.')
      return
    }

    try {
      setEnviando(true)
      setErroDialogo('')
      await criarSolicitacao({
        mentorId: idMentor,
        mentoradoId,
        disciplinaId: Number(disciplinaId),
        dataHora: inicio.toISOString(),
        duracaoMinutos: fimMin - inicioMin,
      })
      toast.success('Sua solicitação foi enviada. Aguarde a confirmação do mentor.')
      setDialogAberto(false)
      setVersao((atual) => atual + 1)
    } catch (error) {
      setErroDialogo(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (erroPagina && !mentor) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">{erroPagina}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const inicioBlocoSelecionado = blocoSelecionado
    ? minutosDesdeMeiaNoite(blocoSelecionado.inicio)
    : 0
  const fimBlocoSelecionado = blocoSelecionado
    ? inicioBlocoSelecionado + blocoSelecionado.duracaoMinutos
    : 0

  return (
    <div className="space-y-6">
      {/* Dados do mentor */}
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center">
          <Avatar className="w-14 h-14 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {mentor ? iniciais(mentor.nome) : 'M'}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {mentor?.nome}
            </h1>
            <p className="text-muted-foreground">{mentor?.email}</p>
            <div className="flex flex-wrap gap-1.5 pt-3">
              {disciplinasDoMentor.map((disciplina) => (
                <Badge
                  key={disciplina.id}
                  variant="outline"
                  className="bg-primary/5"
                >
                  {disciplina.nome}
                </Badge>
              ))}
            </div>
          </div>

          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </CardContent>
      </Card>

      {/* Horários disponíveis */}
      {blocos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Este mentor não possui horários disponíveis no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <div className="flex flex-col gap-3 border-b bg-muted/20 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Semana anterior"
                onClick={() =>
                  setSemanaInicio((atual) => deslocarSemanas(atual, -1))
                }
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
                onClick={() =>
                  setSemanaInicio((atual) => deslocarSemanas(atual, 1))
                }
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
                Horário disponível
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2.5 w-2.5 rounded-full bg-warning" />
                Solicitação pendente
              </span>
            </div>
          </div>

          <CalendarioSemanal
            modo="selecionar"
            dias={dias}
            blocos={blocos}
            agora={agora}
            bloqueado={enviando}
            onAbrirBloco={(bloco) => abrirSolicitacao(bloco)}
            onSelecionarIntervalo={(bloco, inicio, fim) =>
              abrirSolicitacao(bloco, inicio, fim)
            }
          />
        </Card>
      )}

      {/* Confirmação da solicitação */}
      <Dialog
        open={dialogAberto}
        onOpenChange={(aberto) => {
          setDialogAberto(aberto)
          if (!aberto) setErroDialogo('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar mentoria</DialogTitle>
            <DialogDescription>
              Ajuste o horário desejado dentro do período disponibilizado pelo
              mentor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {erroDialogo && (
              <Alert variant="destructive">
                <AlertDescription>{erroDialogo}</AlertDescription>
              </Alert>
            )}

            {blocoSelecionado && (
              <p className="text-sm text-muted-foreground">
                {formatarData(blocoSelecionado.inicio)} · disponível das{' '}
                {rotuloHora(inicioBlocoSelecionado)} às{' '}
                {rotuloHora(fimBlocoSelecionado)}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="solicitacao-disciplina">Disciplina</Label>
              <Select value={disciplinaId} onValueChange={setDisciplinaId}>
                <SelectTrigger
                  id="solicitacao-disciplina"
                  className="w-full h-11"
                >
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinasDoMentor.map((disciplina) => (
                    <SelectItem key={disciplina.id} value={String(disciplina.id)}>
                      {disciplina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solicitacao-inicio">Início</Label>
                <Input
                  id="solicitacao-inicio"
                  type="time"
                  step={900}
                  min={blocoSelecionado ? horarioDosMinutos(inicioBlocoSelecionado) : undefined}
                  max={blocoSelecionado ? horarioDosMinutos(fimBlocoSelecionado) : undefined}
                  className="h-11"
                  value={formulario.inicio}
                  onChange={(evento) =>
                    setFormulario((atual) => ({
                      ...atual,
                      inicio: evento.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solicitacao-fim">Fim</Label>
                <Input
                  id="solicitacao-fim"
                  type="time"
                  step={900}
                  min={blocoSelecionado ? horarioDosMinutos(inicioBlocoSelecionado) : undefined}
                  max={blocoSelecionado ? horarioDosMinutos(fimBlocoSelecionado) : undefined}
                  className="h-11"
                  value={formulario.fim}
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
              Você pode solicitar apenas um trecho do período — o restante continua
              disponível para outros mentorandos. Os horários seguem intervalos de 15
              minutos.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={enviarSolicitacao} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalhes da solicitação pendente (somente leitura) */}
      <Dialog
        open={solicitacaoSelecionada !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setSolicitacaoSelecionada(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitação pendente</DialogTitle>
            <DialogDescription>
              Sua solicitação foi enviada e aguarda a confirmação do mentor.
            </DialogDescription>
          </DialogHeader>

          {solicitacaoSelecionada && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {formatarData(solicitacaoSelecionada.dataHora)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {formatarHora(solicitacaoSelecionada.dataHora)} –{' '}
                    {formatarFim(
                      solicitacaoSelecionada.dataHora,
                      solicitacaoSelecionada.duracaoMinutos,
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Disciplina</p>
                  <p className="font-medium">
                    {solicitacaoSelecionada.disciplinaNome}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Situação</p>
                  <Badge
                    variant="outline"
                    className={classeBadgeSolicitacao.pendente}
                  >
                    {rotuloStatusSolicitacao.pendente}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                O horário fica marcado em amarelo no calendário até o mentor
                responder. Quando a solicitação for aceita, a mentoria aparece em
                Minhas Sessões.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSolicitacaoSelecionada(null)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
