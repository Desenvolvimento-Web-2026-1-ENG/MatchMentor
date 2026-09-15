import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BookOpen, Loader2, LogOut, Mail } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { listarDisciplinasDoUsuario } from '@/services/disciplina.service'
import type { Disciplina } from '@/types'

function iniciais(nome: string) {
  return nome
    .split(' ')
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PerfilPage() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const usuarioId = usuario?.id

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (usuarioId === undefined) return
    const id = usuarioId
    let ativo = true

    async function carregarDados() {
      try {
        const dados = await listarDisciplinasDoUsuario(id)
        if (!ativo) return
        setDisciplinas(dados)
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
  }, [usuarioId])

  const handleSair = () => {
    logout()
    navigate('/login')
  }

  const ehMentor = usuario?.perfil === 'mentor'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Seus dados e suas disciplinas</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {usuario ? iniciais(usuario.nome) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl">{usuario?.nome}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {usuario?.email}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5 w-fit">
            {ehMentor ? 'Mentor' : 'Mentorado'}
          </Badge>
        </CardHeader>
        <CardContent className="flex justify-end">
          <Button variant="outline" onClick={handleSair}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {ehMentor ? 'Disciplinas que você domina' : 'Disciplinas de interesse'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : disciplinas.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              {ehMentor
                ? 'Você ainda não possui disciplinas cadastradas.'
                : 'Você ainda não possui disciplinas de interesse.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {disciplinas.map((disciplina) => (
                <Badge key={disciplina.id} variant="outline" className="bg-primary/5">
                  {disciplina.nome}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
