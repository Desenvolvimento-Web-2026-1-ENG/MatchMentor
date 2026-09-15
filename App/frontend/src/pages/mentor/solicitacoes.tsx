import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Calendar, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import {
  classeBadgeSolicitacao,
  formatarData,
  formatarFim,
  formatarHora,
  rotuloStatusSolicitacao,
} from '@/lib/status'
import { criarSessao } from '@/services/sessao.service'
import {
  atualizarSolicitacao,
  listarSolicitacoesPendentes,
} from '@/services/solicitacao.service'
import type { SolicitacaoPendente } from '@/types'

export function MentorSolicitacoesPage() {
  const { usuario } = useAuth()
  const mentorId = usuario?.id

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPendente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)
  const [processandoId, setProcessandoId] = useState<number | null>(null)

  useEffect(() => {
    if (mentorId === undefined) return
    const id = mentorId
    let ativo = true

    async function carregarSolicitacoes() {
      try {
        const dados = await listarSolicitacoesPendentes(id)
        if (!ativo) return
        setSolicitacoes(dados)
      } catch (error) {
        if (!ativo) return
        toast.error(error instanceof Error ? error.message : 'Erro inesperado')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarSolicitacoes()
    return () => {
      ativo = false
    }
  }, [mentorId, versao])

  const recarregar = () => setVersao((atual) => atual + 1)

  const aceitar = async (solicitacao: SolicitacaoPendente) => {
    try {
      setProcessandoId(solicitacao.solicitacaoId)
      const solicitacaoAceita = await atualizarSolicitacao(
        solicitacao.solicitacaoId,
        'aceita',
      )
      await criarSessao(solicitacaoAceita)
      toast.success('Solicitação aceita e sessão confirmada.')
      recarregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setProcessandoId(null)
    }
  }

  const recusar = async (solicitacao: SolicitacaoPendente) => {
    try {
      setProcessandoId(solicitacao.solicitacaoId)
      await atualizarSolicitacao(solicitacao.solicitacaoId, 'recusada')
      toast.success('Solicitação recusada.')
      recarregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setProcessandoId(null)
    }
  }

  const processando = processandoId !== null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitações de Mentoria</h1>
        <p className="text-muted-foreground">
          Gerencie as solicitações recebidas de mentorados
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Você não possui solicitações pendentes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoes.map((solicitacao) => (
                <div
                  key={solicitacao.solicitacaoId}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {solicitacao.mentoradoNome}
                      </h3>
                      <p className="text-muted-foreground">
                        Solicitou mentoria em{' '}
                        <span className="font-medium text-foreground">
                          {solicitacao.disciplinaNome}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={classeBadgeSolicitacao[solicitacao.status]}
                    >
                      {rotuloStatusSolicitacao[solicitacao.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatarData(solicitacao.dataHora)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatarHora(solicitacao.dataHora)} –{' '}
                      {formatarFim(solicitacao.dataHora, solicitacao.duracaoMinutos)} (
                      {solicitacao.duracaoMinutos} min)
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => aceitar(solicitacao)}
                      disabled={processando}
                    >
                      {processandoId === solicitacao.solicitacaoId ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Aceitar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => recusar(solicitacao)}
                      disabled={processando}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
