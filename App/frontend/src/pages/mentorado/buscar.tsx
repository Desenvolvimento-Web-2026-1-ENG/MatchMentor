import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BookOpen, Loader2, Search, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { listarDisciplinasDoUsuario } from '@/services/disciplina.service'
import { buscarMentoresPorDisciplina } from '@/services/usuario.service'
import type { Disciplina, Usuario } from '@/types'

const TODAS = 'todas'

function iniciais(nome: string) {
  return nome
    .split(' ')
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function normalizar(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function MentoradoBuscarPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const mentoradoId = usuario?.id

  const [interesses, setInteresses] = useState<Disciplina[]>([])
  const [mentores, setMentores] = useState<Usuario[]>([])
  const [carregandoInteresses, setCarregandoInteresses] = useState(true)
  const [carregandoMentores, setCarregandoMentores] = useState(false)
  const [disciplinaFiltro, setDisciplinaFiltro] = useState(TODAS)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (mentoradoId === undefined) return
    const id = mentoradoId
    let ativo = true

    async function carregarInteresses() {
      try {
        const dados = await listarDisciplinasDoUsuario(id)
        if (!ativo) return
        setInteresses(dados)
      } catch (error) {
        if (!ativo) return
        toast.error(error instanceof Error ? error.message : 'Erro inesperado')
      } finally {
        if (ativo) setCarregandoInteresses(false)
      }
    }

    carregarInteresses()
    return () => {
      ativo = false
    }
  }, [mentoradoId])

  // A busca considera apenas mentores que lecionam alguma disciplina de interesse
  // do mentorado (o endpoint devolve somente mentores com horários disponíveis).
  useEffect(() => {
    let ativo = true

    async function carregarMentores() {
      const alvos =
        disciplinaFiltro === TODAS
          ? interesses
          : interesses.filter(
              (disciplina) => String(disciplina.id) === disciplinaFiltro,
            )

      if (alvos.length === 0) {
        setMentores([])
        return
      }

      try {
        setCarregandoMentores(true)
        const listas = await Promise.all(
          alvos.map((disciplina) => buscarMentoresPorDisciplina(disciplina.id)),
        )
        if (!ativo) return

        const porId = new Map<number, Usuario>()
        for (const lista of listas) {
          for (const mentor of lista) {
            if (!porId.has(mentor.id)) porId.set(mentor.id, mentor)
          }
        }
        setMentores([...porId.values()])
      } catch (error) {
        if (!ativo) return
        toast.error(error instanceof Error ? error.message : 'Erro inesperado')
      } finally {
        if (ativo) setCarregandoMentores(false)
      }
    }

    carregarMentores()
    return () => {
      ativo = false
    }
  }, [interesses, disciplinaFiltro])

  const mentoresFiltrados = useMemo(() => {
    const termo = normalizar(busca)
    if (!termo) return mentores
    return mentores.filter((mentor) => normalizar(mentor.nome).includes(termo))
  }, [mentores, busca])

  const limparFiltros = () => {
    setDisciplinaFiltro(TODAS)
    setBusca('')
  }

  const filtrosAtivos = disciplinaFiltro !== TODAS || busca.trim() !== ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buscar Mentores</h1>
        <p className="text-muted-foreground">
          Encontre mentores para as suas disciplinas de interesse
        </p>
      </div>

      {carregandoInteresses ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : interesses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Você ainda não possui disciplinas de interesse.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione disciplinas para encontrar mentores que as lecionam.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate('/mentorado/disciplinas')}
            >
              Adicionar disciplinas
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                <div className="space-y-2">
                  <Label htmlFor="filtro-disciplina">Disciplina</Label>
                  <Select
                    value={disciplinaFiltro}
                    onValueChange={setDisciplinaFiltro}
                  >
                    <SelectTrigger id="filtro-disciplina" className="w-full h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TODAS}>
                        Todas as minhas disciplinas
                      </SelectItem>
                      {interesses.map((disciplina) => (
                        <SelectItem
                          key={disciplina.id}
                          value={String(disciplina.id)}
                        >
                          {disciplina.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filtro-nome">Nome do mentor</Label>
                  <Input
                    id="filtro-nome"
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                    placeholder="Digite um nome"
                    className="h-11"
                  />
                </div>

                <Button
                  variant="outline"
                  className="h-11"
                  onClick={limparFiltros}
                  disabled={!filtrosAtivos}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {carregandoMentores ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : mentoresFiltrados.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <UserRound className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Nenhum mentor encontrado para esta busca.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aparecem aqui os mentores que lecionam uma das suas disciplinas de
                  interesse e que possuem horários disponíveis no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentoresFiltrados.map((mentor) => (
                <Card key={mentor.id} className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col gap-4 pt-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-11 h-11 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {iniciais(mentor.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{mentor.nome}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {mentor.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {mentor.disciplinas.map((disciplina) => (
                        <Badge
                          key={disciplina.id}
                          variant="outline"
                          className="bg-primary/5"
                        >
                          {disciplina.nome}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      className="mt-auto"
                      variant="outline"
                      onClick={() => navigate(`/mentores/${mentor.id}`)}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Ver Perfil
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
