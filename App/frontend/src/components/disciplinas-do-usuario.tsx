import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BookOpen, Loader2, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import {
  adicionarDisciplinaAoUsuario,
  criarDisciplina,
  listarDisciplinas,
  listarDisciplinasDoUsuario,
  removerDisciplinaDoUsuario,
} from '@/services/disciplina.service'
import type { Disciplina } from '@/types'

interface DisciplinasDoUsuarioProps {
  titulo: string
  descricao: string
  textoVazio: string
  textoVazioDetalhe: string
  rotuloBotao?: string
}

/**
 * Gerenciamento das disciplinas de um usuário (do mentor ou os interesses do
 * mentorado): listar as vinculadas, adicionar do catálogo, cadastrar nova e
 * remover. As regras e mensagens vêm do backend.
 */
export function DisciplinasDoUsuario({
  titulo,
  descricao,
  textoVazio,
  textoVazioDetalhe,
  rotuloBotao = 'Adicionar Disciplina',
}: DisciplinasDoUsuarioProps) {
  const { usuario } = useAuth()
  const usuarioId = usuario?.id

  const [vinculadas, setVinculadas] = useState<Disciplina[]>([])
  const [catalogo, setCatalogo] = useState<Disciplina[]>([])
  const [carregando, setCarregando] = useState(true)
  const [versao, setVersao] = useState(0)

  const [dialogAdicionarAberto, setDialogAdicionarAberto] = useState(false)
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState('')
  const [erroAdicionar, setErroAdicionar] = useState('')

  const [dialogNovaAberto, setDialogNovaAberto] = useState(false)
  const [nomeNova, setNomeNova] = useState('')
  const [descricaoNova, setDescricaoNova] = useState('')
  const [erroNova, setErroNova] = useState('')

  const [disciplinaParaRemover, setDisciplinaParaRemover] =
    useState<Disciplina | null>(null)
  const [remocaoAberta, setRemocaoAberta] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (usuarioId === undefined) return
    const id = usuarioId
    let ativo = true

    async function carregarDados() {
      try {
        const [dadosVinculadas, dadosCatalogo] = await Promise.all([
          listarDisciplinasDoUsuario(id),
          listarDisciplinas(),
        ])
        if (!ativo) return
        setVinculadas(dadosVinculadas)
        setCatalogo(dadosCatalogo)
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
  }, [usuarioId, versao])

  const recarregar = () => setVersao((atual) => atual + 1)

  const disponiveisNoCatalogo = catalogo.filter(
    (disciplina) =>
      !vinculadas.some((vinculada) => vinculada.id === disciplina.id),
  )

  const alterarDialogAdicionar = (aberto: boolean) => {
    setDialogAdicionarAberto(aberto)
    if (aberto) {
      setDisciplinaSelecionada('')
      setErroAdicionar('')
    }
  }

  const alterarDialogNova = (aberto: boolean) => {
    setDialogNovaAberto(aberto)
    if (aberto) {
      setNomeNova('')
      setDescricaoNova('')
      setErroNova('')
    }
  }

  const adicionarExistente = async () => {
    if (usuarioId === undefined) return
    if (!disciplinaSelecionada) {
      setErroAdicionar('Selecione uma disciplina.')
      return
    }

    try {
      setSalvando(true)
      setErroAdicionar('')
      const resposta = await adicionarDisciplinaAoUsuario(
        usuarioId,
        Number(disciplinaSelecionada),
      )
      toast.success(resposta.message || 'Disciplina adicionada ao seu perfil.')
      setDialogAdicionarAberto(false)
      recarregar()
    } catch (error) {
      setErroAdicionar(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setSalvando(false)
    }
  }

  const cadastrarEAdicionar = async () => {
    if (usuarioId === undefined) return
    if (!nomeNova.trim() || !descricaoNova.trim()) {
      setErroNova('Preencha o nome e a descrição da disciplina.')
      return
    }

    // Evita o erro bruto do banco (nome único) quando a disciplina já existe
    const nomeNormalizado = nomeNova.trim().toLowerCase()
    const existente = catalogo.find(
      (disciplina) => disciplina.nome.trim().toLowerCase() === nomeNormalizado,
    )
    if (existente) {
      setErroNova(
        vinculadas.some((vinculada) => vinculada.id === existente.id)
          ? 'Esta disciplina já está no seu perfil.'
          : 'Esta disciplina já está no catálogo. Adicione-a pela lista de disciplinas.',
      )
      return
    }

    try {
      setSalvando(true)
      setErroNova('')
      const nova = await criarDisciplina({
        nome: nomeNova.trim(),
        descricao: descricaoNova.trim(),
      })
      await adicionarDisciplinaAoUsuario(usuarioId, nova.id)
      toast.success('Disciplina criada e adicionada ao seu perfil.')
      setDialogNovaAberto(false)
      setDialogAdicionarAberto(false)
      recarregar()
    } catch (error) {
      setErroNova(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setSalvando(false)
    }
  }

  const remover = async () => {
    if (usuarioId === undefined || !disciplinaParaRemover) return

    try {
      setSalvando(true)
      const resposta = await removerDisciplinaDoUsuario(
        usuarioId,
        disciplinaParaRemover.id,
      )
      toast.success(resposta.message || 'Disciplina removida do seu perfil.')
      setRemocaoAberta(false)
      recarregar()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro inesperado')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{titulo}</h1>
          <p className="text-muted-foreground">{descricao}</p>
        </div>
        <Button onClick={() => alterarDialogAdicionar(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {rotuloBotao}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : vinculadas.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{textoVazio}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {textoVazioDetalhe}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vinculadas.map((disciplina) => (
                <div
                  key={disciplina.id}
                  className="flex items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium block truncate">
                        {disciplina.nome}
                      </span>
                      {disciplina.descricao && (
                        <span className="text-xs text-muted-foreground block truncate">
                          {disciplina.descricao}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive shrink-0"
                    aria-label={`Remover ${disciplina.nome}`}
                    onClick={() => {
                      setDisciplinaParaRemover(disciplina)
                      setRemocaoAberta(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adicionar disciplina do catálogo */}
      <Dialog open={dialogAdicionarAberto} onOpenChange={alterarDialogAdicionar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Disciplina</DialogTitle>
            <DialogDescription>
              Selecione uma disciplina do catálogo para adicionar ao seu perfil.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {erroAdicionar && (
              <Alert variant="destructive">
                <AlertDescription>{erroAdicionar}</AlertDescription>
              </Alert>
            )}

            {disponiveisNoCatalogo.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todas as disciplinas do catálogo já estão no seu perfil.
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="disciplina">Disciplina</Label>
                <Select
                  value={disciplinaSelecionada}
                  onValueChange={setDisciplinaSelecionada}
                >
                  <SelectTrigger id="disciplina" className="w-full h-11">
                    <SelectValue placeholder="Selecione uma disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disponiveisNoCatalogo.map((disciplina) => (
                      <SelectItem key={disciplina.id} value={String(disciplina.id)}>
                        {disciplina.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="button"
              variant="link"
              className="px-0 h-auto"
              onClick={() => {
                alterarDialogAdicionar(false)
                alterarDialogNova(true)
              }}
            >
              Não encontrou? Cadastre uma nova disciplina
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => alterarDialogAdicionar(false)}>
              Cancelar
            </Button>
            <Button
              onClick={adicionarExistente}
              disabled={salvando || disponiveisNoCatalogo.length === 0}
            >
              {salvando ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cadastrar nova disciplina */}
      <Dialog open={dialogNovaAberto} onOpenChange={alterarDialogNova}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar nova disciplina</DialogTitle>
            <DialogDescription>
              Crie uma disciplina que ainda não está no catálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {erroNova && (
              <Alert variant="destructive">
                <AlertDescription>{erroNova}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="nova-disciplina">Nome</Label>
              <Input
                id="nova-disciplina"
                value={nomeNova}
                onChange={(evento) => setNomeNova(evento.target.value)}
                placeholder="Ex: Álgebra Linear"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nova-descricao">Descrição</Label>
              <Textarea
                id="nova-descricao"
                value={descricaoNova}
                onChange={(evento) => setDescricaoNova(evento.target.value)}
                placeholder="Breve descrição da disciplina"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => alterarDialogNova(false)}>
              Cancelar
            </Button>
            <Button onClick={cadastrarEAdicionar} disabled={salvando}>
              {salvando ? 'Cadastrando...' : 'Cadastrar e adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de remoção */}
      <AlertDialog open={remocaoAberta} onOpenChange={setRemocaoAberta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover disciplina?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &quot;{disciplinaParaRemover?.nome}&quot; do
              seu perfil?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remover} disabled={salvando}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
