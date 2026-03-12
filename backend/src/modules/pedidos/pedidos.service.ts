import { query } from '../../database/connection';
import { FinanceiroService } from '../financeiro/financeiro.service';

const financeiroService = new FinanceiroService();

export type StatusPedido = 'aberto' | 'preparando' | 'pronto' | 'entregue' | 'fechado';

export class PedidosService {

  async listarPedidosDaMesa(mesaId: string) {
    const res = await query(
      `SELECT p.*, json_agg(json_build_object(
          'id', i.id,
          'produto_id', i.produto_id,
          'produto_nome', pr.nome,
          'quantidade', i.quantidade,
          'preco_unitario', i.preco_unitario,
          'subtotal', i.subtotal
        )) FILTER (WHERE i.id IS NOT NULL) as itens
       FROM pedidos p
       LEFT JOIN itens_pedido i ON i.pedido_id = p.id
       LEFT JOIN produtos pr ON pr.id = i.produto_id
       WHERE p.mesa_id = $1 AND p.status != 'fechado'
       GROUP BY p.id
       ORDER BY p.criado_em DESC`,
      [mesaId]
    );
    return res.rows;
  }

  async criarPedidoMesa(mesaId: string, clienteId?: string) {
    const pedidoAberto = await query(
      `SELECT id FROM pedidos WHERE mesa_id = $1 AND status != 'fechado'`,
      [mesaId]
    );
    if (pedidoAberto.rowCount && pedidoAberto.rowCount > 0) {
      throw new Error(`Já existe um pedido em andamento para esta mesa`);
    }

    const res = await query(
      `INSERT INTO pedidos (mesa_id, cliente_id, tipo, status, total) VALUES ($1, $2, 'mesa', 'aberto', 0) RETURNING *`,
      [mesaId, clienteId || null]
    );

    await query(`UPDATE mesas SET status = 'ocupada' WHERE id = $1`, [mesaId]);

    return res.rows[0];
  }

  async adicionarItens(pedidoId: string, itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>) {
    const resPedido = await query(`SELECT id, total FROM pedidos WHERE id = $1 AND status != 'fechado'`, [pedidoId]);
    if (resPedido.rowCount === 0) throw new Error('Pedido não encontrado ou já foi fechado');

    const pedido = resPedido.rows[0];
    let totalAdicionado = 0;

    const itensInseridos = [];
    for (const item of itens) {
      const subtotal = item.quantidade * item.preco_unitario;
      totalAdicionado += subtotal;

      const resItem = await query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [pedidoId, item.produto_id, item.quantidade, item.preco_unitario, subtotal]
      );
      itensInseridos.push(resItem.rows[0]);
    }

    const novoTotal = Number(pedido.total) + totalAdicionado;
    await query(`UPDATE pedidos SET total = $1 WHERE id = $2`, [novoTotal, pedidoId]);

    // Inserir na fila de impressão para cozinha/bar
    const nomesRes = await query(
      `SELECT p.nome FROM itens_pedido ip JOIN produtos p ON p.id = ip.produto_id WHERE ip.id = ANY($1)`,
      [itensInseridos.map(i => i.id)]
    );

    try {
      await query(
        `INSERT INTO fila_impressao (pedido_id, setor, conteudo, status) VALUES ($1, 'cozinha', $2, 'pendente')`,
        [pedidoId, `PEDIDO MESA\n${itens.map((it, idx) => `${it.quantidade}x ${nomesRes.rows[idx]?.nome || 'Item'}`).join('\n')}`]
      );
    } catch (_) { /* Ignora erros de impressão para não bloquear o pedido */ }

    return itensInseridos;
  }

  async atualizarStatusPedido(pedidoId: string, novoStatus: StatusPedido) {
    const res = await query(
      `UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *`,
      [novoStatus, pedidoId]
    );
    if (res.rowCount === 0) throw new Error('Pedido não encontrado');
    return res.rows[0];
  }

  async finalizarPedidoMesa(pedidoId: string, pagamentos: { forma: string; valor: number }[]) {
    console.log(`[PedidosService] Iniciando finalização do pedido: ${pedidoId}`);

    const resPedido = await query('SELECT * FROM pedidos WHERE id = $1', [pedidoId]);
    if (resPedido.rowCount === 0) throw new Error('Pedido não encontrado');
    const pedido = resPedido.rows[0];

    // 1. Registrar Receitas (Múltiplas)
    console.log(`[PedidosService] Registrando ${pagamentos.length} pagamentos...`);
    for (const pg of pagamentos) {
      await financeiroService.registrarReceita(pedidoId, pg.forma, pg.valor);
    }

    // 2. Liberar Mesa (apenas se for pedido local contendo mesa_id) e Fechar Pedido
    console.log(`[PedidosService] Processando liberação (se aplicável)...`);
    if (pedido.mesa_id) {
      await query(
        `UPDATE mesas SET status = 'livre', cliente_nome = NULL, aberta_em = NULL WHERE id = $1`,
        [pedido.mesa_id]
      );
    }

    await query(`UPDATE pedidos SET status = 'fechado' WHERE id = $1`, [pedidoId]);

    // 3. Fila de Impressão (CAIXA)
    const resumoItens = await query(
      `SELECT i.quantidade, pr.nome, i.subtotal 
       FROM itens_pedido i 
       JOIN produtos pr ON i.produto_id = pr.id 
       WHERE i.pedido_id = $1`,
      [pedidoId]
    );

    const itensStr = resumoItens.rows.map(it => `${it.quantidade}x ${it.nome} - R$ ${it.subtotal}`).join('\n');
    const pgsStr = pagamentos.map(p => `${p.forma}: R$ ${p.valor}`).join('\n');

    const conteudoCaixa = `--- CONTA FECHADA ---\nPedido: ${pedidoId}\n\nITENS:\n${itensStr}\n\nTOTAL: R$ ${pedido.total}\n\nPAGAMENTOS:\n${pgsStr}\n\nObrigado!`;

    try {
      await query(
        `INSERT INTO fila_impressao (pedido_id, setor, conteudo, status) VALUES ($1, 'caixa', $2, 'pendente')`,
        [pedidoId, conteudoCaixa]
      );
    } catch (_) { /* Ignora erros de impressão */ }

    console.log(`[PedidosService] Finalização concluída com sucesso para o pedido ${pedidoId}`);
    return { status: 'sucesso', pedidoId };
  }
}
