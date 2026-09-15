import { DisciplinasDoUsuario } from '@/components/disciplinas-do-usuario'

export function MentorDisciplinasPage() {
  return (
    <DisciplinasDoUsuario
      titulo="Minhas Disciplinas"
      descricao="Gerencie as disciplinas que você domina"
      textoVazio="Você ainda não possui disciplinas cadastradas."
      textoVazioDetalhe="Adicione disciplinas para que mentorados possam te encontrar."
    />
  )
}
