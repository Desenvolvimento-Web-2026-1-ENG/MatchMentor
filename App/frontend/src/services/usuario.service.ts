import { api } from './api'
import type { CriarUsuarioPayload, Usuario, UsuarioCadastrado } from '@/types'

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/usuarios')
  return data
}

export async function buscarUsuario(usuarioId: number): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/usuarios/${usuarioId}`)
  return data
}

export async function cadastrarUsuario(
  payload: CriarUsuarioPayload,
): Promise<UsuarioCadastrado> {
  const { data } = await api.post<UsuarioCadastrado>('/usuarios', payload)
  return data
}

export async function buscarMentoresPorDisciplina(
  disciplinaId: number,
): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>(`/usuarios/mentores/${disciplinaId}`)
  return data
}
