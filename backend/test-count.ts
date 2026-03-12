
import { query } from './src/database/connection';
async function run() {
  const r1 = await query('SELECT count(id) as total FROM clientes');
  console.log('Clientes:', r1.rows);
  const r2 = await query('SELECT count(id) as total FROM pedidos WHERE status != ''fechado''');
  console.log('Pedidos:', r2.rows);
  process.exit(0);
}
run();

