import { Router } from 'express';
import { DeliveryController } from './delivery.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const rotasDelivery = Router();
const controller = new DeliveryController();

rotasDelivery.use(verificarTokenMiddleware);
rotasDelivery.use(autorizarPorTipo(['master', 'funcionario']));

rotasDelivery.get('/', controller.listar);
rotasDelivery.post('/', controller.criar);
rotasDelivery.patch('/:id/status', controller.status);

export { rotasDelivery };
