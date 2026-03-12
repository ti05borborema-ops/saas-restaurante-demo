import { query } from '../../database/connection';
import { emitirEvento } from '../../websockets';

export type StatusImpressao = 'pendente' | 'impresso' | 'falha';

export class ImpressaoService {
  async listarFilaPendentes(setor?: string) {
    let q = 'SELECT * FROM fila_impressao WHERE status = $1';
    const params: any[] = ['pendente'];

    if (setor) {
      q += ' AND setor = $2';
      params.push(setor);
    }

    q += ' ORDER BY criado_em ASC';
    const res = await query(q, params);
    return res.rows;
  }

  async marcarComoImpresso(impressaoId: string) {
    const res = await query(
      `UPDATE fila_impressao SET status = 'impresso' WHERE id = $1 RETURNING *`,
      [impressaoId]
    );

    if (res.rowCount === 0) throw new Error('Trabalho de impressão não encontrado');

    const trabalho = res.rows[0];
    emitirEvento('status_impressao', { id: trabalho.id, status: 'impresso', setor: trabalho.setor });

    return trabalho;
  }

  async registrarFalha(impressaoId: string) {
    // Incrementa a tentativa e marca como falha
    const res = await query(
      `UPDATE fila_impressao 
       SET status = 'falha', tentativas = tentativas + 1 
       WHERE id = $1 RETURNING *`,
      [impressaoId]
    );

    if (res.rowCount === 0) throw new Error('Trabalho de impressão não encontrado');

    const trabalho = res.rows[0];
    emitirEvento('status_impressao', { id: trabalho.id, status: 'falha', setor: trabalho.setor });

    return trabalho;
  }
}
