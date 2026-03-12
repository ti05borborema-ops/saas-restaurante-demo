import { query } from '../../database/connection';

export class FinanceiroService {
  async registrarReceita(pedidoId: string, formaPagamento: string, valor: number) {
    console.log(`[Financeiro] Registrando receita: Pedido=${pedidoId}, Forma=${formaPagamento}, Valor=${valor}`);
    // Validar se o pedido existe e já não foi faturado
    const resPedido = await query('SELECT total, status FROM pedidos WHERE id = $1', [pedidoId]);
    if (resPedido.rowCount === 0) throw new Error('Pedido não existe');

    const pedido = resPedido.rows[0];
    
    // Inserir receita
    const res = await query(
       `INSERT INTO receitas (pedido_id, valor, forma_pagamento) VALUES ($1, $2, $3) RETURNING *`,
       [pedidoId, valor, formaPagamento]
    );

    return res.rows[0];
  }

  async relatorioDiario(data: string) {
    // data no formato YYYY-MM-DD
    const res = await query(
      `SELECT forma_pagamento, SUM(valor) as total_arrecadado, COUNT(id) as qtd_pagamentos
       FROM receitas
       WHERE DATE(criado_em) = $1
       GROUP BY forma_pagamento`,
      [data]
    );

    const totalGeral = res.rows.reduce((acc: number, curr: any) => acc + Number(curr.total_arrecadado), 0);

    return {
      resumo_pagamentos: res.rows,
      total_do_dia: totalGeral
    };
  }

  async relatorioMensal(anoMes: string) {
     // anoMes no formato YYYY-MM
     const res = await query(
      `SELECT DATE(criado_em) as dia, SUM(valor) as total_dia
       FROM receitas
       WHERE to_char(criado_em, 'YYYY-MM') = $1
       GROUP BY dia
       ORDER BY dia ASC`,
      [anoMes]
    );
    return res.rows;
  }
}
