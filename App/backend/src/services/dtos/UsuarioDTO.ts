export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: "mentor" | "mentorado";
}

export interface DadosBasicosUsuarioDTO {
  id: string;
  nome: string;
  email: string;
  perfil: "mentor" | "mentorado";
}