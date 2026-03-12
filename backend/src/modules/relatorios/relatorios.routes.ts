import { Router } from 'express';
import { RelatoriosController } from './relatorios.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const router = Router();
const relatoriosController = new RelatoriosController();

router.use(verificarTokenMiddleware);
router.use(autorizarPorTipo(['master']));

router.get('/auditoria', relatoriosController.auditoria);
router.get('/dashboard', relatoriosController.dashboardMetrics);

export { router as rotasRelatorios };
