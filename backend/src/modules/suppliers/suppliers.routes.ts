import { Router } from 'express';
import { SuppliersController } from './suppliers.controller';

const router = Router();
const controller = new SuppliersController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

export { router as rotasFornecedores };
