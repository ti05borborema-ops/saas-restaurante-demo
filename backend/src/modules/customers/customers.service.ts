import { query } from '../../database/connection';

export class CustomersService {
  async listar() {
    const res = await query('SELECT * FROM clientes ORDER BY nome ASC');
    return res.rows;
  }

  async buscarPorId(id: string) {
    const res = await query('SELECT * FROM clientes WHERE id = $1', [id]);
    return res.rows[0];
  }

  async criar(dados: { nome: string; telefone?: string; endereco?: string }) {
    const res = await query(
      'INSERT INTO clientes (nome, telefone, endereco) VALUES ($1, $2, $3) RETURNING *',
      [dados.nome, dados.telefone || null, dados.endereco || null]
    );
    return res.rows[0];
  }

  async atualizar(id: string, dados: { nome?: string; telefone?: string; endereco?: string }) {
    const atual = await this.buscarPorId(id);
    if (!atual) throw new Error('Cliente não encontrado');

    const nome = dados.nome || atual.nome;
    const telefone = dados.telefone !== undefined ? dados.telefone : atual.telefone;
    const endereco = dados.endereco !== undefined ? dados.endereco : atual.endereco;

    const res = await query(
      'UPDATE clientes SET nome = $1, telefone = $2, endereco = $3 WHERE id = $4 RETURNING *',
      [nome, telefone, endereco, id]
    );
    return res.rows[0];
  }

  async excluir(id: string) {
    await query('DELETE FROM clientes WHERE id = $1', [id]);
    return { message: 'Cliente excluído com sucesso' };
  }
}
