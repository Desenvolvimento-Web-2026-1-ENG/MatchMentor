import type { Disciplina } from '../entities/Disciplina.js';
import type { IDisciplinaRepository } from '../repositories/IDisciplinaRepository.js';
import type { DetalhesDisciplinaDTO } from './dtos/DisciplinaDTO.js';
import type { IUsuarioRepository } from '../repositories/IUsuarioRepository.js';

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

        const usuario = this.usuarioRepository.buscarPorId(usuarioId);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        usuario.disciplinas.push(disciplina);
    }

    removerDisciplinaDoUsuario(usuarioId: number, disciplinaId: number): void {
        const usuario = this.usuarioRepository.buscarPorId(usuarioId);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        usuario.disciplinas = usuario.disciplinas.filter(d => d.id !== disciplinaId);
    }
}