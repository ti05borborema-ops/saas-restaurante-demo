import { Router } from 'express';
import { PedidosController } from './pedidos.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const rotasPedidos = Router();
const controller = new PedidosController();

rotasPedidos.use(verificarTokenMiddleware);
// Apenas staff logado
rotasPedidos.use(autorizarPorTipo(['master', 'funcionario']));

rotasPedidos.get('/mesa/:mesaId', controller.listarDaMesa);
rotasPedidos.post('/', controller.criar);
rotasPedidos.post('/:id/itens', controller.adicionarItens);
rotasPedidos.patch('/:id/status', controller.atualizarStatus);
rotasPedidos.post('/:id/finalizar', controller.finalizar);

export { rotasPedidos };
