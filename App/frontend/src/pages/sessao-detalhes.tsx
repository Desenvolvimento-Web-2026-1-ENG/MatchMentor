import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle, Loader2, Video, XCircle } from 'lucide-react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  classeBadgeSessao,
  formatarData,
  formatarFim,
  formatarHora,
  rotuloStatusSessao,
} from '@/lib/status'
import { atualizarStatusSessao, detalhesSessao } from '@/services/sessao.service'
import type { SessaoDetalhes } from '@/types'

export function SessaoDetalhesPage() {
  const navigate = useNavigate()
  const { sessaoId } = useParams()
  const id = Number(sessaoId)

  const [sessao, setSessao] = useState<SessaoDetalhes | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [versao, setVersao] = useState(0)
  const [agora, setAgora] = useState(() => new Date())

  const [confirmarRealizada, setConfirmarRealizada] = useState(false)
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(id)) return
    let ativo = true

    async function carregarDados() {
      try {
        const dados = await detalhesSessao(id)
        if (!ativo) return
        setSessao(dados)
        setErro('')
        setAgora(new Date())
      } catch (error) {
        if (!ativo) return
        setErro(error instanceof Error ? error.message : 'Erro inesperado')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarDados()
    return () => {
      ativo = false
    }
  }, [id, versao])

  const atualizarStatus = async (status: 'concluida' | 'cancelada') => {
    try {
      setProcessando(true)
      await atualizarStatusSessao(id, status)
      toast.success(
        status === 'concluida'
          ? 'Sessão registrada como realizada com sucesso.'
          : 'Sessão cancelada com sucesso.',
      )
      setConfirmarRealizada(false)
      setConfirmarCancelamento(false)
      setVersao((atual) => atual + 1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setProcessando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (erro || !sessao) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-muted-foreground">{erro || 'Sessão não encontrada.'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/sessoes')}>
            Voltar para Minhas Sessões
          </Button>
        </CardContent>
      </Card>
    )
  }

  const fim = new Date(
    new Date(sessao.dataHora).getTime() + sessao.duracaoMinutos * 60_000,
  )
  const jaTerminou = agora.getTime() >= fim.getTime()
  const podeMarcarRealizada = sessao.status === 'agendada' && jaTerminou
  const podeCancelar = sessao.status === 'agendada'

  const linhas = [
    { rotulo: 'Mentor', valor: sessao.mentorNome },
    { rotulo: 'Mentorado', valor: sessao.mentoradoNome },
    { rotulo: 'Disciplina', valor: sessao.disciplinaNome },
    { rotulo: 'Data', valor: formatarData(sessao.dataHora) },
    {
      rotulo: 'Horário',
      valor: `${formatarHora(sessao.dataHora)} – ${formatarFim(sessao.dataHora, sessao.duracaoMinutos)}`,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          onClick={() => navigate('/sessoes')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Detalhes da Sessão</h1>
          <p className="text-muted-foreground">
            Informações da mentoria e ações disponíveis
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{sessao.disciplinaNome}</CardTitle>
            <CardDescription>
              {formatarData(sessao.dataHora)} ·{' '}
              {formatarHora(sessao.dataHora)} às{' '}
              {formatarFim(sessao.dataHora, sessao.duracaoMinutos)}
            </CardDescription>
          </div>
          <Badge variant="outline" className={classeBadgeSessao[sessao.status]}>
            {rotuloStatusSessao[sessao.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {linhas.map((linha) => (
              <div key={linha.rotulo} className="space-y-1">
                <p className="text-sm text-muted-foreground">{linha.rotulo}</p>
                <p className="font-medium">{linha.valor}</p>
              </div>
            ))}
          </div>

          {sessao.linkReuniao && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Link da reunião</p>
              <p className="font-medium flex items-center gap-2 break-all">
                <Video className="w-4 h-4 text-primary shrink-0" />
                {sessao.linkReuniao}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {podeCancelar && (
              <Button
                variant="outline"
                onClick={() => setConfirmarCancelamento(true)}
                disabled={processando}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar sessão
              </Button>
            )}
            {podeMarcarRealizada && (
              <Button
                onClick={() => setConfirmarRealizada(true)}
                disabled={processando}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Realizada
              </Button>
            )}
          </div>

          {sessao.status === 'agendada' && !jaTerminou && (
            <p className="text-xs text-muted-foreground text-right">
              A opção de marcar como realizada aparece após o horário de término da
              sessão.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Confirmação de sessão realizada */}
      <AlertDialog open={confirmarRealizada} onOpenChange={setConfirmarRealizada}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar que esta sessão foi realizada?</AlertDialogTitle>
            <AlertDialogDescription>
              A sessão passará para o seu histórico como realizada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => atualizarStatus('concluida')}
              disabled={processando}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de cancelamento */}
      <AlertDialog
        open={confirmarCancelamento}
        onOpenChange={setConfirmarCancelamento}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar esta sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              O horário voltará a ficar disponível para o mentor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => atualizarStatus('cancelada')}
              disabled={processando}
            >
              Cancelar sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
