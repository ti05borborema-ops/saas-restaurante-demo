import { Router } from 'express';
import { CustomersController } from './customers.controller';

const router = Router();
const controller = new CustomersController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

export { router as rotasClientes };
