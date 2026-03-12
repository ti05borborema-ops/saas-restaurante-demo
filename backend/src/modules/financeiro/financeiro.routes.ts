import { Router } from 'express';
import { FinanceiroController } from './financeiro.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const rotasFinanceiro = Router();
const controller = new FinanceiroController();

rotasFinanceiro.use(verificarTokenMiddleware);
// Protegendo rotas financeiras para uso restrito
rotasFinanceiro.post('/faturar', autorizarPorTipo(['master', 'funcionario']), controller.registrar);
rotasFinanceiro.get('/relatorios/diario', autorizarPorTipo(['master']), controller.diario);
rotasFinanceiro.get('/relatorios/mensal', autorizarPorTipo(['master']), controller.mensal);

export { rotasFinanceiro };
