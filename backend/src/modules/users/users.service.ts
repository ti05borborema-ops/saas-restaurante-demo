import bcrypt from 'bcrypt';
import { query } from '../../database/connection';

export class UsersService {
  async listarTodos() {
    const res = await query('SELECT id, nome, email, tipo, ativo, criado_em FROM usuarios ORDER BY nome ASC');
    return res.rows;
  }

  async criar(dados: { nome: string; email?: string; senha: string; tipo: string }) {
    const hashedSenha = await bcrypt.hash(dados.senha, 10);
    const res = await query(
      'INSERT INTO usuarios (nome, email, senha, tipo, ativo) VALUES ($1, $2, $3, $4, true) RETURNING id, nome, email, tipo, ativo',
      [dados.nome, dados.email || null, hashedSenha, dados.tipo]
    );
    return res.rows[0];
  }

  async atualizar(id: string, dados: { nome?: string; email?: string; senha?: string; tipo?: string; ativo?: boolean }) {
    let sql = 'UPDATE usuarios SET ';
    const params = [];
    let count = 1;

    if (dados.nome) {
      sql += `nome = $${count}, `;
      params.push(dados.nome);
      count++;
    }
    if (dados.email) {
      sql += `email = $${count}, `;
      params.push(dados.email);
      count++;
    }
    if (dados.tipo) {
      sql += `tipo = $${count}, `;
      params.push(dados.tipo);
      count++;
    }
    if (dados.ativo !== undefined) {
      sql += `ativo = $${count}, `;
      params.push(dados.ativo);
      count++;
    }
    if (dados.senha) {
      const hashedSenha = await bcrypt.hash(dados.senha, 10);
      sql += `senha = $${count}, `;
      params.push(hashedSenha);
      count++;
    }

    // Remove last comma and space
    sql = sql.slice(0, -2);
    sql += ` WHERE id = $${count} RETURNING id, nome, email, tipo, ativo`;
    params.push(id);

    const res = await query(sql, params);
    if (res.rowCount === 0) throw new Error('Usuário não encontrado');
    return res.rows[0];
  }

  async deletar(id: string) {
    const res = await query('DELETE FROM usuarios WHERE id = $1', [id]);
    if (res.rowCount === 0) throw new Error('Usuário não encontrado');
    return { success: true };
  }
}
