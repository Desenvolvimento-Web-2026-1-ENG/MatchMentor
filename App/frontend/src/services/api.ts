import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem = error?.response?.data?.error ?? 'Erro inesperado'
    return Promise.reject(new Error(mensagem))
  },
)
