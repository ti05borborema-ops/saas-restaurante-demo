import { query } from '../../database/connection';

export class CardapioService {
  // --------- CATEGORIAS ---------
  async listarCategorias() {
    const res = await query('SELECT * FROM categorias ORDER BY nome ASC');
    return res.rows;
  }

  async criarCategoria(nome: string) {
    const res = await query(
      'INSERT INTO categorias (nome) VALUES ($1) RETURNING *',
      [nome]
    );
    return res.rows[0];
  }

  // --------- PRODUTOS ---------
  async listarProdutos(ativo?: boolean) {
    let q = 'SELECT * FROM produtos';
    const params: any[] = [];
    
    if (ativo !== undefined) {
      q += ' WHERE ativo = $1';
      params.push(ativo);
    }
    
    q += ' ORDER BY nome ASC';
    const res = await query(q, params);
    return res.rows;
  }

  async criarProduto(dados: {
    nome: string;
    preco: number;
    categoria_id: string;
    descricao?: string;
    setor?: 'cozinha' | 'bar' | 'caixa';
  }) {
    const res = await query(
      `INSERT INTO produtos (nome, descricao, preco, categoria_id, setor)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dados.nome, dados.descricao || null, dados.preco, dados.categoria_id, dados.setor || null]
    );
    return res.rows[0];
  }

  async alternarDisponibilidadeProduto(id: string, ativo: boolean) {
    const res = await query(
      'UPDATE produtos SET ativo = $1 WHERE id = $2 RETURNING *',
      [ativo, id]
    );
    if (res.rowCount === 0) {
      throw new Error('Produto não encontrado');
    }
    return res.rows[0];
  }
}
