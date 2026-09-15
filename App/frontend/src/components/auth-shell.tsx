import type { ReactNode } from 'react'
import { BookOpen, Calendar, GraduationCap, Users } from 'lucide-react'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Painel de apresentação */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">MatchMentor</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground leading-tight text-balance">
              Conectando conhecimento, construindo futuros.
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              A plataforma que une alunos experientes a calouros para suporte acadêmico
              personalizado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-primary-foreground/10 rounded-lg">
              <Users className="w-5 h-5 text-primary-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary-foreground">Mentoria Personalizada</h3>
                <p className="text-sm text-primary-foreground/70">
                  Encontre o mentor ideal para suas necessidades
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary-foreground/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary-foreground">Agendamento Flexível</h3>
                <p className="text-sm text-primary-foreground/70">
                  Escolha horários que funcionam para você
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary-foreground/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary-foreground">Diversas Disciplinas</h3>
                <p className="text-sm text-primary-foreground/70">
                  Cálculo, Programação, Física e muito mais
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary-foreground/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-primary-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary-foreground">Sucesso Acadêmico</h3>
                <p className="text-sm text-primary-foreground/70">
                  Melhore seu desempenho com ajuda de pares
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          2026 MatchMentor. Plataforma acadêmica de mentorias.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MatchMentor</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
