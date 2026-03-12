import { Pool } from 'pg';

import dotenv from 'dotenv';
dotenv.config();

// Configuração flexível: Prioriza DATABASE_URL (Render/Cloud) ou usa as credenciais locais
export const pool = new Pool(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para Supabase/Render em muitos casos
  }
} : {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'restaurante_pos',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'akrwceWswtE0JfxS',
});

// Teste inicial de conexão para fail-fast
pool.on('error', (err) => {
  console.error('Erro inesperado no cliente PostgreSQL', err);
  process.exit(-1);
});

/**
 * Executa uma query SQL nativa com os parâmetros informados.
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Opcional: console.log('Executado query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Erro executando query:', text, error);
    throw error;
  }
};

export default {
  query,
  pool
};
