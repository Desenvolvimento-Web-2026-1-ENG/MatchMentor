import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'

export function HomePage() {
  const { usuario } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={usuario.perfil === 'mentor' ? '/mentor' : '/mentorado'} replace />
}
