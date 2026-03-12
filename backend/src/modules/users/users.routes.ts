import { Router } from 'express';
import { UsersController } from './users.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const router = Router();
const usersController = new UsersController();

router.use(verificarTokenMiddleware);
router.use(autorizarPorTipo(['master']));

router.get('/', usersController.listar);
router.post('/', usersController.criar);
router.put('/:id', usersController.atualizar);
router.delete('/:id', usersController.deletar);

export { router as rotasUsuarios };
