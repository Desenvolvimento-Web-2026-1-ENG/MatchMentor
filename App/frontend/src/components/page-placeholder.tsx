import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PagePlaceholderProps {
  titulo: string
  descricao?: string
}

export function PagePlaceholder({ titulo, descricao }: PagePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>
          {descricao ?? 'Esta tela será implementada nas próximas etapas do roadmap.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Em construção.</p>
      </CardContent>
    </Card>
  )
}
