const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'restaurante_pos',
  password: 'akrwceWswtE0JfxS',
  port: 5432,
});
client.connect().then(async () => {
  const c = await client.query('SELECT COUNT(id) as total FROM clientes');
  console.log('clientes:', c.rows);
  const p = await client.query(SELECT COUNT(id) as total FROM pedidos WHERE status != 'fechado');
  console.log('pedidos:', p.rows);
  client.end();
}).catch(console.error);
