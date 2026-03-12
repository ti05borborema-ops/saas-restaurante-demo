import { query } from '../../database/connection';
import { emitirEvento } from '../../websockets';

export type StatusMesa = 'livre' | 'ocupada' | 'aguardando_pagamento';

export class MesasService {
  async listarTodas() {
    const res = await query('SELECT * FROM mesas ORDER BY numero ASC');
    return res.rows;
  }

  async buscarPorId(id: string) {
    const res = await query('SELECT * FROM mesas WHERE id = $1', [id]);
    if (res.rowCount === 0) {
      throw new Error('Mesa não encontrada');
    }
    return res.rows[0];
  }

  async atualizarStatus(id: string, novoStatus: StatusMesa, clienteNome?: string) {
    const res = await query(
      `UPDATE mesas 
       SET status = $1, 
           cliente_nome = $2, 
           aberta_em = CASE WHEN $1 = 'ocupada' AND status = 'livre' THEN CURRENT_TIMESTAMP ELSE aberta_em END,
           fechada_em = CASE WHEN $1 = 'livre' THEN CURRENT_TIMESTAMP ELSE nULL END
       WHERE id = $3 
       RETURNING *`,
      [novoStatus, clienteNome || null, id]
    );

    if (res.rowCount === 0) {
      throw new Error('Mesa não encontrada para atualização');
    }

    const mesaAtualizada = res.rows[0];

    // Emitir evento websocket para todos os clientes
    emitirEvento('mesa_status_alterado', mesaAtualizada);

    return mesaAtualizada;
  }
}
