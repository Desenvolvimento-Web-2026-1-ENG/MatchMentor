import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { Toaster } from '@/components/ui/sonner'
import { CadastroPage } from '@/pages/cadastro'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { PerfilPage } from '@/pages/perfil'
import { SessaoDetalhesPage } from '@/pages/sessao-detalhes'
import { SessoesPage } from '@/pages/sessoes'
import { MentorProfilePage } from '@/pages/mentor-profile'
import { MentorDashboardPage } from '@/pages/mentor/dashboard'
import { MentorDisciplinasPage } from '@/pages/mentor/disciplinas'
import { MentorDisponibilidadePage } from '@/pages/mentor/disponibilidade'
import { MentorSolicitacoesPage } from '@/pages/mentor/solicitacoes'
import { MentoradoDashboardPage } from '@/pages/mentorado/dashboard'
import { MentoradoBuscarPage } from '@/pages/mentorado/buscar'
import { MentoradoDisciplinasPage } from '@/pages/mentorado/disciplinas'

export function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/sessoes" element={<SessoesPage />} />
            <Route path="/sessoes/:sessaoId" element={<SessaoDetalhesPage />} />
            <Route path="/mentores/:mentorId" element={<MentorProfilePage />} />

            <Route path="/mentor" element={<MentorDashboardPage />} />
            <Route path="/mentor/disciplinas" element={<MentorDisciplinasPage />} />
            <Route path="/mentor/disponibilidade" element={<MentorDisponibilidadePage />} />
            <Route path="/mentor/solicitacoes" element={<MentorSolicitacoesPage />} />

            <Route path="/mentorado" element={<MentoradoDashboardPage />} />
            <Route path="/mentorado/buscar" element={<MentoradoBuscarPage />} />
            <Route path="/mentorado/disciplinas" element={<MentoradoDisciplinasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </>
  )
}
