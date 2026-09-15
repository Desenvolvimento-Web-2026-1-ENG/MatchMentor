import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BookOpen, Calendar, Loader2, Search } from 'lucide-react'
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
import { classeBadgeSessao, formatarDataHora, rotuloStatusSessao } from '@/lib/status'
import { listarDisciplinasDoUsuario } from '@/services/disciplina.service'
import { listarSessoes } from '@/services/sessao.service'
import type { Disciplina, Sessao } from '@/types'

export function MentoradoDashboardPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const mentoradoId = usuario?.id

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (mentoradoId === undefined) return
    const id = mentoradoId
    let ativo = true

    async function carregarDados() {
      try {
        const [dadosDisciplinas, dadosSessoes] = await Promise.all([
          listarDisciplinasDoUsuario(id),
          listarSessoes(id, 'mentorado'),
        ])
        if (!ativo) return
        setDisciplinas(dadosDisciplinas)
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
  }, [mentoradoId])

  const primeiroNome = usuario?.nome.split(' ')[0] ?? ''

  const proximasSessoes = sessoes
    .filter((sessao) => sessao.status === 'agendada')
    .sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Olá, {primeiroNome}!
          </h1>
          <p className="text-muted-foreground">
            Encontre mentores e acompanhe suas mentorias.
          </p>
        </div>
        <Button onClick={() => navigate('/mentorado/buscar')}>
          <Search className="w-4 h-4 mr-2" />
          Buscar Mentores
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/mentorado/disciplinas')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold">{disciplinas.length}</p>
                <p className="text-sm text-muted-foreground truncate">
                  Disciplinas de Interesse
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/sessoes')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Calendar className="w-5 h-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold">{proximasSessoes.length}</p>
                <p className="text-sm text-muted-foreground truncate">
                  Próximas Sessões
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {disciplinas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-6">
            <p className="text-sm text-muted-foreground">
              Você ainda não possui disciplinas de interesse. Adicione disciplinas
              para encontrar mentores que as lecionam.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/mentorado/disciplinas')}
            >
              Adicionar disciplinas
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Próximas sessões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Próximas Sessões</CardTitle>
            <CardDescription>Suas mentorias confirmadas</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/sessoes')}>
            Ver todas
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
                    <p className="font-medium truncate">{sessao.mentorNome}</p>
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
  )
}
