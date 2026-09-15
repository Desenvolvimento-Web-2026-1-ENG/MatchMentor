import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AuthShell } from '@/components/auth-shell'
import { useAuth } from '@/contexts/auth-context'
import { cadastrarUsuario } from '@/services/usuario.service'
import type { Perfil } from '@/types'

export function CadastroPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [perfil, setPerfil] = useState<Perfil | ''>('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setErro('')

    if (!nome || !email || !senha || !confirmacaoSenha || !perfil) {
      setErro('Preencha todos os campos.')
      return
    }

    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (senha !== confirmacaoSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    try {
      setCarregando(true)
      const usuarioCriado = await cadastrarUsuario({ nome, email, senha, perfil })

      login({
        id: usuarioCriado.id,
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        perfil: usuarioCriado.perfil,
        disciplinas: [],
      })

      navigate(usuarioCriado.perfil === 'mentor' ? '/mentor' : '/mentorado')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthShell>
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-foreground">Criar Conta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Junte-se à comunidade MatchMentor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <Alert variant="destructive">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@universidade.edu"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmacao-senha">Confirmar Senha</Label>
              <Input
                id="confirmacao-senha"
                type="password"
                placeholder="Repita sua senha"
                value={confirmacaoSenha}
                onChange={(evento) => setConfirmacaoSenha(evento.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label>Eu sou...</Label>
              <RadioGroup
                value={perfil}
                onValueChange={(valor) => setPerfil(valor as Perfil)}
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="mentor" id="perfil-mentor" />
                  <div className="flex-1">
                    <Label htmlFor="perfil-mentor" className="font-medium cursor-pointer">
                      Mentor
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Quero ajudar outros alunos com disciplinas que domino
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="mentorado" id="perfil-mentorado" />
                  <div className="flex-1">
                    <Label htmlFor="perfil-mentorado" className="font-medium cursor-pointer">
                      Mentorado
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Preciso de auxílio em algumas disciplinas
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full h-11" disabled={carregando}>
              {carregando ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
