import { query } from '../../database/connection';
import { emitirEvento } from '../../websockets';

export type StatusDelivery = 'pendente' | 'em_preparo' | 'saiu_entrega' | 'entregue' | 'cancelado';

export class DeliveryService {
  async listarPedidos() {
    const res = await query(
      `SELECT d.id as delivery_id, d.endereco, d.status as status_delivery, d.criado_em as data_delivery,
              p.id as pedido_id, p.total, p.status as status_pedido,
              c.nome as cliente_nome, c.telefone as cliente_telefone,
              json_agg(json_build_object(
                 'id', i.id,
                 'produto_nome', pr.nome,
                 'quantidade', i.quantidade,
                 'preco_unitario', i.preco_unitario
              )) as itens
       FROM deliveries d
       JOIN pedidos p ON d.pedido_id = p.id
       JOIN clientes c ON p.cliente_id = c.id
       LEFT JOIN itens_pedido i ON p.id = i.pedido_id
       LEFT JOIN produtos pr ON i.produto_id = pr.id
       GROUP BY d.id, p.id, c.id
       ORDER BY d.criado_em DESC`
    );
    return res.rows;
  }

  async criarPedidoDelivery(clienteId: string, endereco: string) {
    // 1. Criar o pedido (tipo = delivery)
    const resPedido = await query(
      `INSERT INTO pedidos (tipo, cliente_id, status, total) 
       VALUES ('delivery', $1, 'aberto', 0) RETURNING id`,
      [clienteId]
    );
    const pedidoId = resPedido.rows[0].id;

    // 2. Criar registro de entrega
    const resDelivery = await query(
      `INSERT INTO deliveries (pedido_id, endereco, status) 
       VALUES ($1, $2, 'pendente') RETURNING *`,
      [pedidoId, endereco]
    );
    const novoDelivery = resDelivery.rows[0];

    // WebSocket Notify
    emitirEvento('pedido_delivery_criado', novoDelivery);

    return novoDelivery;
  }

  async atualizarStatus(deliveryId: string, status: StatusDelivery) {
    const res = await query(
      `UPDATE deliveries SET status = $1 WHERE id = $2 RETURNING *`,
      [status, deliveryId]
    );

    if (res.rowCount === 0) throw new Error('Delivery não encontrado');

    const atualizado = res.rows[0];

    // Se saiu para entrega ou finalizou, atualiza o pedido principal para refletir no admin/financeiro
    if (status === 'entregue') {
      await query(`UPDATE pedidos SET status = 'entregue' WHERE id = $1`, [atualizado.pedido_id]);
    }

    emitirEvento('status_delivery_alterado', atualizado);
    return atualizado;
  }
}
