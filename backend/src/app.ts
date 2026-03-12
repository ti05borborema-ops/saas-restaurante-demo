import express from 'express';
import cors from 'cors';
import { manipuladorErros } from './core/erros';
import { rotasAutenticacao } from './modules/autenticacao/autenticacao.routes';
import { rotasMesas } from './modules/mesas/mesas.routes';
import { rotasCardapio } from './modules/cardapio/cardapio.routes';
import { rotasPedidos } from './modules/pedidos/pedidos.routes';
import { rotasFinanceiro } from './modules/financeiro/financeiro.routes';
import { rotasConfiguracoes } from './modules/configuracoes/configuracoes.routes';
import { rotasDelivery } from './modules/delivery/delivery.routes';
import { rotasImpressao } from './modules/impressao/impressao.routes';
import { rotasClientes } from './modules/customers/customers.routes';
import { rotasFornecedores } from './modules/suppliers/suppliers.routes';
import { rotasUsuarios } from './modules/users/users.routes';
import { rotasRelatorios } from './modules/relatorios/relatorios.routes';

import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Log de Inicialização de Rotas
console.log('[App] Registrando rotas...');

app.use('/api/autenticacao', rotasAutenticacao);
app.use('/api/mesas', rotasMesas);
app.use('/api/cardapio', rotasCardapio);
app.use('/api/pedidos', rotasPedidos);
app.use('/api/financeiro', rotasFinanceiro);
app.use('/api/configuracoes', rotasConfiguracoes);
app.use('/api/delivery', rotasDelivery);
app.use('/api/impressao', rotasImpressao);
app.use('/api/clientes', rotasClientes);
app.use('/api/fornecedores', rotasFornecedores);
app.use('/api/usuarios', rotasUsuarios);
app.use('/api/relatorios', rotasRelatorios);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ambiente: 'RestaurantePro - Demo Unified' });
});

// ── SERVIR FRONTEND (PRODUÇÃO) ───────────────────────────────────
// O build do frontend gera os arquivos em ../frontend/dist
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Fallback para SPA (qualquer rota que não seja /api, serve o index.html)
app.use((req, res, next) => {
  // Se a rota começa com /api e chegou aqui, é porque não existe no backend (404)
  if (req.path.startsWith('/api')) return next();
  
  // Para qualquer outra rota (navegação do Vue), entrega o index.html
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(manipuladorErros);

export default app;
