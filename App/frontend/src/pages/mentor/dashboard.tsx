import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, BookOpen, Calendar, Clock, Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import {
  classeBadgeSessao,
  classeBadgeSolicitacao,
  formatarDataHora,
  rotuloStatusSessao,
  rotuloStatusSolicitacao,
} from '@/lib/status'
import { listarDisciplinasDoUsuario } from '@/services/disciplina.service'
import { listarSessoes } from '@/services/sessao.service'
import { listarSolicitacoesPendentes } from '@/services/solicitacao.service'
import { listarSlotsDoMentor } from '@/services/slot.service'
import type { Disciplina, Sessao, Slot, SolicitacaoPendente } from '@/types'

export function MentorDashboardPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const mentorId = usuario?.id

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPendente[]>([])
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (mentorId === undefined) return
    const id = mentorId
    let ativo = true

    async function carregarDados() {
      try {
        setCarregando(true)
        const [dadosDisciplinas, dadosSlots, dadosSolicitacoes, dadosSessoes] =
          await Promise.all([
            listarDisciplinasDoUsuario(id),
            listarSlotsDoMentor(id),
            listarSolicitacoesPendentes(id),
            listarSessoes(id, 'mentor'),
          ])

        if (!ativo) return
        setDisciplinas(dadosDisciplinas)
        setSlots(dadosSlots)
        setSolicitacoes(dadosSolicitacoes)
        setSessoes(dadosSessoes)
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
  }, [mentorId])

  const primeiroNome = usuario?.nome.split(' ')[0] ?? ''

  const slotsDisponiveis = slots.filter((slot) => slot.status === 'disponivel').length

  const proximasSessoes = sessoes
    .filter((sessao) => sessao.status === 'agendada')
    .sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
    )

  const indicadores = [
    {
      titulo: 'Disciplinas',
      valor: disciplinas.length,
      destino: '/mentor/disciplinas',
      fundo: 'bg-primary/10',
      icone: <BookOpen className="w-5 h-5 text-primary" />,
    },
    {
      titulo: 'Slots Disponíveis',
      valor: slotsDisponiveis,
      destino: '/mentor/disponibilidade',
      fundo: 'bg-chart-2/10',
      icone: <Calendar className="w-5 h-5 text-chart-2" />,
    },
    {
      titulo: 'Pendentes',
      valor: solicitacoes.length,
      destino: '/mentor/solicitacoes',
      fundo: 'bg-warning/10',
      icone: <Clock className="w-5 h-5 text-warning" />,
    },
    {
      titulo: 'Próximas Sessões',
      valor: proximasSessoes.length,
      destino: '/sessoes',
      fundo: 'bg-success/10',
      icone: <Users className="w-5 h-5 text-success" />,
    },
  ]

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {primeiroNome}!</h1>
        <p className="text-muted-foreground">
          Gerencie suas mentorias e ajude outros alunos.
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {indicadores.map((indicador) => (
          <Card
            key={indicador.titulo}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(indicador.destino)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${indicador.fundo}`}>{indicador.icone}</div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold">{indicador.valor}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {indicador.titulo}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Solicitações pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Solicitações Pendentes</CardTitle>
              <CardDescription>Mentorados aguardando sua resposta</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/mentor/solicitacoes')}
            >
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {solicitacoes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Você não possui solicitações pendentes.
              </p>
            ) : (
              <div className="space-y-3">
                {solicitacoes.slice(0, 3).map((solicitacao) => (
                  <div
                    key={solicitacao.solicitacaoId}
                    className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{solicitacao.mentoradoNome}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {solicitacao.disciplinaNome} ·{' '}
                        {formatarDataHora(solicitacao.dataHora)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={classeBadgeSolicitacao[solicitacao.status]}
                    >
                      {rotuloStatusSolicitacao[solicitacao.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas sessões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Próximas Sessões</CardTitle>
              <CardDescription>Suas mentorias confirmadas</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/sessoes')}>
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {proximasSessoes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Você não possui sessões agendadas.
              </p>
            ) : (
              <div className="space-y-3">
                {proximasSessoes.slice(0, 3).map((sessao) => (
                  <div
                    key={sessao.id}
                    className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{sessao.mentoradoNome}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {sessao.disciplinaNome} · {formatarDataHora(sessao.dataHora)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={classeBadgeSessao[sessao.status]}
                    >
                      {rotuloStatusSessao[sessao.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
