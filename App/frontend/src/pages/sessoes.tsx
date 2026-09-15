import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar, ChevronRight, Clock, Loader2, XCircle } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import {
  classeBadgeSessao,
  formatarData,
  formatarFim,
  formatarHora,
  rotuloStatusSessao,
} from '@/lib/status'
import { atualizarStatusSessao, listarSessoes } from '@/services/sessao.service'
import type { Sessao } from '@/types'

export function SessoesPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const usuarioId = usuario?.id
  const perfil = usuario?.perfil

  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)

  const [sessaoParaCancelar, setSessaoParaCancelar] = useState<Sessao | null>(null)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    if (usuarioId === undefined || perfil === undefined) return
    const id = usuarioId
    const perfilAtual = perfil
    let ativo = true

    async function carregarDados() {
      try {
        const dados = await listarSessoes(id, perfilAtual)
        if (!ativo) return
        setSessoes(dados)
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
  }, [usuarioId, perfil, versao])

  const { proximas, historico } = useMemo(() => {
    const agendadas = sessoes
      .filter((sessao) => sessao.status === 'agendada')
      .sort(
        (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
      )
    const encerradas = sessoes
      .filter((sessao) => sessao.status !== 'agendada')
      .sort(
        (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
      )
    return { proximas: agendadas, historico: encerradas }
  }, [sessoes])

  const nomeDaOutraParte = (sessao: Sessao) =>
    perfil === 'mentor' ? sessao.mentoradoNome : sessao.mentorNome

  const confirmarCancelamento = async () => {
    if (!sessaoParaCancelar) return

    try {
      setCancelando(true)
      await atualizarStatusSessao(sessaoParaCancelar.id, 'cancelada')
      toast.success('Sessão cancelada com sucesso.')
      setSessaoParaCancelar(null)
      setVersao((atual) => atual + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setCancelando(false)
    }
  }

  const itemDaSessao = (sessao: Sessao, permiteCancelar: boolean) => (
    <div
      key={sessao.id}
      className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg sm:flex-row sm:items-center sm:justify-between"
    >
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => navigate(`/sessoes/${sessao.id}`)}
      >
        <p className="font-medium truncate">{sessao.disciplinaNome}</p>
        <p className="text-sm text-muted-foreground truncate">
          {nomeDaOutraParte(sessao)} · {formatarData(sessao.dataHora)} ·{' '}
          {formatarHora(sessao.dataHora)} –{' '}
          {formatarFim(sessao.dataHora, sessao.duracaoMinutos)}
        </p>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={classeBadgeSessao[sessao.status]}>
          {rotuloStatusSessao[sessao.status]}
        </Badge>
        {permiteCancelar && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSessaoParaCancelar(sessao)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ver detalhes"
          onClick={() => navigate(`/sessoes/${sessao.id}`)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

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
        <h1 className="text-2xl font-bold text-foreground">Minhas Sessões</h1>
        <p className="text-muted-foreground">
          Acompanhe suas sessões agendadas e o histórico
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Próximas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proximas.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Você não possui sessões agendadas.
            </p>
          ) : (
            <div className="space-y-3">
              {proximas.map((sessao) => itemDaSessao(sessao, true))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Você ainda não possui sessões realizadas.
            </p>
          ) : (
            <div className="space-y-3">
              {historico.map((sessao) => itemDaSessao(sessao, false))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmação de cancelamento */}
      <AlertDialog
        open={sessaoParaCancelar !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setSessaoParaCancelar(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              {sessaoParaCancelar
                ? `A sessão de ${formatarData(sessaoParaCancelar.dataHora)} das ${formatarHora(sessaoParaCancelar.dataHora)} às ${formatarFim(sessaoParaCancelar.dataHora, sessaoParaCancelar.duracaoMinutos)} será cancelada e o horário voltará a ficar disponível para o mentor.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCancelamento} disabled={cancelando}>
              Cancelar sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
