import { Router } from 'express';
import { MesasController } from './mesas.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const rotasMesas = Router();
const controller = new MesasController();

// Todas as rotas de mesas exigem estar logado
rotasMesas.use(verificarTokenMiddleware);

rotasMesas.get('/', controller.listar);
rotasMesas.get('/:id', controller.buscar);
rotasMesas.patch('/:id/status', autorizarPorTipo(['master', 'funcionario']), controller.atualizarStatus);

export { rotasMesas };
