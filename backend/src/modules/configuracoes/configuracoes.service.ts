import { query } from '../../database/connection';

export class ConfiguracoesService {
  async obterConfiguracao() {
    const res = await query('SELECT * FROM configuracoes LIMIT 1');
    if (res.rowCount === 0) {
      // Cria registro default se não existir
      const novo = await query(`INSERT INTO configuracoes (nome_restaurante, quantidade_mesas) VALUES ('RestaurantePro', 10) RETURNING *`);
      return novo.rows[0];
    }
    return res.rows[0];
  }

  async atualizarConfiguracao(dados: { nome_restaurante?: string; quantidade_mesas?: number }) {
    const configAtual = await this.obterConfiguracao();
    
    const novoNome = dados.nome_restaurante || configAtual.nome_restaurante;
    const novaQtdMesas = dados.quantidade_mesas || configAtual.quantidade_mesas;

    const res = await query(
      `UPDATE configuracoes 
       SET nome_restaurante = $1, quantidade_mesas = $2 
       WHERE id = $3 RETURNING *`,
      [novoNome, novaQtdMesas, configAtual.id]
    );

    // Ajustar Mesas Dinamicamente se quantidade alterou
    if (dados.quantidade_mesas && dados.quantidade_mesas !== configAtual.quantidade_mesas) {
      await this.sincronizarMesas(dados.quantidade_mesas);
    }

    return res.rows[0];
  }

  private async sincronizarMesas(quantidadeFinais: number) {
    const resCount = await query('SELECT COUNT(*) as total FROM mesas');
    const totalAtual = parseInt(resCount.rows[0].total);

    if (quantidadeFinais > totalAtual) {
      // Adicionar Mesas que faltam
      for (let i = totalAtual + 1; i <= quantidadeFinais; i++) {
        await query(`INSERT INTO mesas (numero, status) VALUES ($1, 'livre')`, [i]);
      }
    } else if (quantidadeFinais < totalAtual) {
       // Remover De trás pra frente apenas se estiverem livres
       for (let i = totalAtual; i > quantidadeFinais; i--) {
          await query(`DELETE FROM mesas WHERE numero = $1 AND status = 'livre'`, [i]);
       }
    }
  }
}
