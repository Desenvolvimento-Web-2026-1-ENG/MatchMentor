import type { Disciplina } from '../entities/Disciplina.js';
import type { IDisciplinaRepository } from '../repositories/IDisciplinaRepository.js';
import type { DetalhesDisciplinaDTO } from './dtos/DisciplinaDTO.js';
import type { IUsuarioRepository } from '../repositories/IUsuarioRepository.js';
import type { Mentor } from '../entities/Mentor.js';
import type { Mentorado } from '../entities/Mentorado.js';

export class DisciplinaService {
    constructor(private disciplinaRepository: IDisciplinaRepository, private usuarioRepository: IUsuarioRepository) {}

    criarDisciplina(disciplina: DetalhesDisciplinaDTO): Disciplina {
        return this.disciplinaRepository.criar({
            id: 0, // O ID será gerado pelo repositório
            nome: disciplina.nome,
            descricao: disciplina.descricao
        });
    }

    adicionarDisciplinaAoUsuario(usuarioId: number, disciplinaId: number): void {
        const disciplina = this.disciplinaRepository.buscarPorId(disciplinaId);
        if (!disciplina) {
            throw new Error('Disciplina não encontrada');
        }

        // Aqui você precisaria de um repositório de usuários para buscar o usuário e adicionar a disciplina.
        // Este é apenas um exemplo, você precisará implementar a lógica real de acordo com sua arquitetura.
        const usuario = this.usuarioRepository.buscarPorId(usuarioId);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        switch (usuario.perfil) {
            case "mentor":
                (usuario as Mentor).disciplinasMentoradas.push(disciplina);
                break;
            case "mentorado":
                (usuario as Mentorado).disciplinasInteresse.push(disciplina);
                break;
            default:
                throw new Error('Perfil de usuário desconhecido');
        }
    }

    removerDisciplinaDoUsuario(usuarioId: number, disciplinaId: number): void {
        const usuario = this.usuarioRepository.buscarPorId(usuarioId);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        switch (usuario.perfil) {
            case "mentor":
                (usuario as Mentor).disciplinasMentoradas = (usuario as Mentor).disciplinasMentoradas.filter(d => d.id !== disciplinaId);
                break;
            case "mentorado":
                (usuario as Mentorado).disciplinasInteresse = (usuario as Mentorado).disciplinasInteresse.filter(d => d.id !== disciplinaId);
                break;
            default:
                throw new Error('Perfil de usuário desconhecido');
        }
    }
}