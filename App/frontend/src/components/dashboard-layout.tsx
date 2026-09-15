import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'

interface NavItem {
  label: string
  to: string
  icon: ReactNode
}

const mentorNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/mentor', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Minhas Disciplinas', to: '/mentor/disciplinas', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Disponibilidade', to: '/mentor/disponibilidade', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Solicitações', to: '/mentor/solicitacoes', icon: <Clock className="w-4 h-4" /> },
  { label: 'Sessões', to: '/sessoes', icon: <History className="w-4 h-4" /> },
]

const mentoradoNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/mentorado', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Buscar Mentores', to: '/mentorado/buscar', icon: <User className="w-4 h-4" /> },
  { label: 'Minhas Disciplinas', to: '/mentorado/disciplinas', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Minhas Sessões', to: '/sessoes', icon: <Calendar className="w-4 h-4" /> },
]

function getInitials(nome: string) {
  return nome
    .split(' ')
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function DashboardLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  const navItems = usuario?.perfil === 'mentor' ? mentorNavItems : mentoradoNavItems

  const estaAtivo = (to: string) => location.pathname === to

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label="Abrir menu"
            >
              {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground hidden sm:inline">
                MatchMentor
              </span>
            </div>
          </div>

          {/* Navegação desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.to}
                asChild
                variant={estaAtivo(item.to) ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <NavLink to={item.to}>
                  {item.icon}
                  {item.label}
                </NavLink>
              </Button>
            ))}
          </nav>

          {/* Menu do usuário */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {usuario ? getInitials(usuario.nome) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">{usuario?.nome}</span>
                    <Badge variant="outline" className="text-xs h-5">
                      {usuario?.perfil === 'mentor' ? 'Mentor' : 'Mentorado'}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{usuario?.nome}</p>
                  <p className="text-xs text-muted-foreground">{usuario?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navegação mobile */}
        {menuAberto && (
          <nav className="lg:hidden border-t border-border bg-card px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.to}
                asChild
                variant={estaAtivo(item.to) ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <NavLink to={item.to} onClick={() => setMenuAberto(false)}>
                  {item.icon}
                  {item.label}
                </NavLink>
              </Button>
            ))}
          </nav>
        )}
      </header>

      {/* Conteúdo */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
