import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AuthShell } from '@/components/auth-shell'
import { useAuth } from '@/contexts/auth-context'
import { listarUsuarios } from '@/services/usuario.service'
import type { Usuario } from '@/types'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        setCarregando(true)
        setErro('')
        const dados = await listarUsuarios()
        setUsuarios(dados)
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Erro inesperado')
      } finally {
        setCarregando(false)
      }
    }

    carregarUsuarios()
  }, [])

  const mentores = usuarios.filter((usuario) => usuario.perfil === 'mentor')
  const mentorados = usuarios.filter((usuario) => usuario.perfil === 'mentorado')

  const handleEntrar = () => {
    const usuario = usuarios.find((item) => String(item.id) === usuarioSelecionadoId)
    if (!usuario) {
      setErro('Selecione um usuário para entrar.')
      return
    }

    login(usuario)
    navigate(usuario.perfil === 'mentor' ? '/mentor' : '/mentorado')
  }

  return (
    <AuthShell>
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-foreground">Entrar</CardTitle>
          <CardDescription className="text-muted-foreground">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {erro && (
              <Alert variant="destructive">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            {!carregando && usuarios.length === 0 && !erro && (
              <Alert>
                <AlertDescription>
                  Nenhum usuário cadastrado ainda. Crie uma conta para começar.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="usuario">Entrar como</Label>
              <Select
                value={usuarioSelecionadoId}
                onValueChange={setUsuarioSelecionadoId}
                disabled={carregando || usuarios.length === 0}
              >
                <SelectTrigger id="usuario" className="h-11 w-full">
                  <SelectValue
                    placeholder={carregando ? 'Carregando usuários...' : 'Selecione um usuário'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Mentores</SelectLabel>
                    {mentores.map((usuario) => (
                      <SelectItem key={usuario.id} value={String(usuario.id)}>
                        {usuario.nome} — {usuario.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Mentorados</SelectLabel>
                    {mentorados.map((usuario) => (
                      <SelectItem key={usuario.id} value={String(usuario.id)}>
                        {usuario.nome} — {usuario.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              className="w-full h-11"
              onClick={handleEntrar}
              disabled={carregando || !usuarioSelecionadoId}
            >
              Entrar
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-primary font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
