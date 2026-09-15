import { DisciplinasDoUsuario } from '@/components/disciplinas-do-usuario'

export function MentoradoDisciplinasPage() {
  return (
    <DisciplinasDoUsuario
      titulo="Disciplinas de Interesse"
      descricao="Escolha as disciplinas em que você busca mentoria"
      textoVazio="Você ainda não possui disciplinas de interesse."
      textoVazioDetalhe="Adicione disciplinas para encontrar mentores que as lecionam."
    />
  )
}
