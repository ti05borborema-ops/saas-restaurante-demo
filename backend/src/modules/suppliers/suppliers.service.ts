import { query } from '../../database/connection';

export class SuppliersService {
  async listar() {
    const res = await query('SELECT * FROM fornecedores ORDER BY nome ASC');
    return res.rows;
  }

  async buscarPorId(id: string) {
    const res = await query('SELECT * FROM fornecedores WHERE id = $1', [id]);
    return res.rows[0];
  }

  async criar(dados: { nome: string; telefone?: string; contato?: string }) {
    const res = await query(
      'INSERT INTO fornecedores (nome, telefone, contato) VALUES ($1, $2, $3) RETURNING *',
      [dados.nome, dados.telefone || null, dados.contato || null]
    );
    return res.rows[0];
  }

  async atualizar(id: string, dados: { nome?: string; telefone?: string; contato?: string }) {
    const atual = await this.buscarPorId(id);
    if (!atual) throw new Error('Fornecedor não encontrado');

    const nome = dados.nome || atual.nome;
    const telefone = dados.telefone !== undefined ? dados.telefone : atual.telefone;
    const contato = dados.contato !== undefined ? dados.contato : atual.contato;

    const res = await query(
      'UPDATE fornecedores SET nome = $1, telefone = $2, contato = $3 WHERE id = $4 RETURNING *',
      [nome, telefone, contato, id]
    );
    return res.rows[0];
  }

  async excluir(id: string) {
    await query('DELETE FROM fornecedores WHERE id = $1', [id]);
    return { message: 'Fornecedor excluído com sucesso' };
  }
}
