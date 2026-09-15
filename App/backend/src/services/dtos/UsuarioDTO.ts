export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: "mentor" | "mentorado";
}

export interface DadosBasicosUsuarioDTO {
  id: number;
  nome: string;
  email: string;
  perfil: "mentor" | "mentorado";
  disciplinas: { id: number; nome: string }[];
}