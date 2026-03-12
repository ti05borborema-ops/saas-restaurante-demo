import fs from 'fs';
import path from 'path';
import { query, pool } from './connection';
import bcrypt from 'bcrypt';

async function initDatabase() {
  console.log('Iniciando construção do banco de dados RestaurantePro...');

  try {
    // 1. Ler e executar o schema SQL bruto
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, { encoding: 'utf-8' });

    console.log('Aplicando schema.sql...');
    await query(sqlContent);
    console.log('Schema aplicado com sucesso!');

    // 2. Limpeza na ordem correta das Foreign Keys
    console.log('Limpando dados antigos para reinicialização limpa...');
    await query('DELETE FROM fila_impressao');
    await query('DELETE FROM receitas');
    await query('DELETE FROM deliveries');
    await query('DELETE FROM itens_pedido');
    await query('DELETE FROM pedidos');
    await query('DELETE FROM mesas');
    await query('DELETE FROM produtos');
    await query('DELETE FROM categorias');
    await query('DELETE FROM usuarios');

    // 3. Usuários Master (Deivid e Guilherme)
    console.log('Recriando Deivid e Guilherme como masters...');
    const hash = await bcrypt.hash('123456', 10);
    await query('INSERT INTO usuarios (nome, email, senha, tipo, ativo) VALUES ($1, $2, $3, $4, true)', ['Deivid', 'deivid@pos.com', hash, 'master']);
    await query('INSERT INTO usuarios (nome, email, senha, tipo, ativo) VALUES ($1, $2, $3, $4, true)', ['Guilherme', 'guilherme@pos.com', hash, 'master']);

    // 4. Carga de Cardápio Demo Robusta
    console.log('Carregando cardápio demo completo...');
    const demoMenu = [
      {
        cat: '🍔 Burgers Premium',
        items: [
          { n: 'Pro Burger Bacon', d: 'Pão brioche, blend 180g, bacon crocante, cheddar.', p: 38.90, s: 'cozinha' },
          { n: 'Cheese Salada Classic', d: 'Carne, queijo, alface, tomate e maionese.', p: 29.00, s: 'cozinha' }
        ]
      },
      {
        cat: '🍕 Pizzas Artesanais',
        items: [
          { n: 'Margherita G', d: 'Tomate italiano e manjericão fresco.', p: 48.00, s: 'cozinha' },
          { n: 'Calabresa Premium G', d: 'Artesanal com cebola roxa.', p: 45.00, s: 'cozinha' }
        ]
      },
      {
        cat: '🥤 Bebidas',
        items: [
          { n: 'Coca-Cola 350ml', d: 'Gelada.', p: 7.50, s: 'copa' },
          { n: 'Suco Natural Laranja', d: '500ml espremido na hora.', p: 12.00, s: 'copa' }
        ]
      },
      {
        cat: '🍟 Porções',
        items: [
          { n: 'Batata Rústica', d: 'Crocante com alecrim.', p: 24.00, s: 'cozinha' },
          { n: 'Frango a Passarinho', d: '500g suculento com alho e óleo.', p: 42.00, s: 'cozinha' }
        ]
      }
    ];

    for (const group of demoMenu) {
      const res = await query('INSERT INTO categorias (nome) VALUES ($1) RETURNING id', [group.cat]);
      const cid = res.rows[0].id;
      for (const item of group.items) {
        await query(
          'INSERT INTO produtos (nome, descricao, preco, categoria_id, setor, ativo) VALUES ($1, $2, $3, $4, $5, true)',
          [item.n, item.d, item.p, cid, item.s]
        );
      }
    }

    // 5. Mesas Configuradas (Auto generate 10 mesas)
    console.log('Gerando as 10 mesas configuradas...');
    for (let i = 1; i <= 10; i++) {
        await query('INSERT INTO mesas (numero, status) VALUES ($1, $2)', [i, 'livre']);
    }

    console.log('✓ Banco de dados inicializado perfeitamente!');

    console.log('✓ Banco de dados inicializado perfeitamente!');
  } catch (error) {
    console.error('Erro catastrófico ao inicializar o banco:', error);
  } finally {
    // Encerrar a pool para o script finalizar com sucesso
    await pool.end();
  }
}

initDatabase();
