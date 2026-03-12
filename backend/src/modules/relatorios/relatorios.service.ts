import { query } from '../../database/connection';

export class RelatoriosService {
  async auditoriaVendas(dataInicio?: string, dataFim?: string) {
    let sql = `
      SELECT 
        p.id as pedido_id,
        p.mesa_id,
        m.numero as mesa_numero,
        p.total,
        p.status,
        p.criado_em as data,
        (
          SELECT json_agg(json_build_object(
            'item_id', i.id,
            'produto', pr.nome,
            'quantidade', i.quantidade,
            'preco', i.preco_unitario,
            'subtotal', i.subtotal
          ))
          FROM itens_pedido i
          JOIN produtos pr ON i.produto_id = pr.id
          WHERE i.pedido_id = p.id
        ) as itens,
        (
          SELECT json_agg(json_build_object(
            'forma', r.forma_pagamento,
            'valor', r.valor,
            'pago_em', r.criado_em
          ))
          FROM receitas r
          WHERE r.pedido_id = p.id
        ) as pagamentos
      FROM pedidos p
      JOIN mesas m ON p.mesa_id = m.id
      WHERE p.status = 'fechado'
    `;

    const params = [];
    if (dataInicio && dataFim) {
      sql += ` AND p.criado_em BETWEEN $1 AND $2`;
      params.push(dataInicio, dataFim);
    }

    sql += ` ORDER BY p.criado_em DESC`;

    const res = await query(sql, params);
    return res.rows;
  }

  async getDashboardMetrics() {
    // Faturamento de hoje
    const faturamentoRes = await query(`
      SELECT SUM(valor) as total
      FROM receitas
      WHERE DATE(criado_em) = CURRENT_DATE
    `);
    
    // Filtramos o NaN por precaução no SQL (usando COALESCE ou map)
    const faturamentoHoje = Number(faturamentoRes.rows[0]?.total) || 0;

    // Pedidos Abertos (status = 'aberto' ou 'preparando' ou 'pronto')
    const pedidosAbertosRes = await query(`
      SELECT COUNT(id) as total FROM pedidos WHERE status != 'fechado'
    `);
    const pedidosAbertos = Number(pedidosAbertosRes.rows[0]?.total) || 0;

    // Mesas Ocupadas
    const mesasRes = await query(`
      SELECT 
        SUM(CASE WHEN status = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
        COUNT(id) as total
      FROM mesas
    `);
    const mesasOcupadas = Number(mesasRes.rows[0]?.ocupadas) || 0;
    const totalMesas = Number(mesasRes.rows[0]?.total) || 0;

    // Clientes Cadastrados
    const clientesRes = await query(`
      SELECT COUNT(id) as total FROM clientes
    `);
    const clientesInst = Number(clientesRes.rows[0]?.total) || 0;

    return {
      faturamentoHoje,
      pedidosAbertos,
      mesasOcupadas,
      totalMesas,
      clientesCadastrados: clientesInst
    };
  }
}

