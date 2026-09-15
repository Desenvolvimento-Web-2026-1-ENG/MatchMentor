import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Usuario } from '@/types'

const STORAGE_KEY = 'matchmentor:usuario'

interface AuthContextValue {
  usuario: Usuario | null
  login: (usuario: Usuario) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function carregarUsuarioSalvo(): Usuario | null {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY)
    return salvo ? (JSON.parse(salvo) as Usuario) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(carregarUsuarioSalvo)

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [usuario])

  const login = useCallback((novoUsuario: Usuario) => {
    setUsuario(novoUsuario)
  }, [])

  const logout = useCallback(() => {
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.')
  }
  return context
}
