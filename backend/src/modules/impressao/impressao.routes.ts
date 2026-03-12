import { Router } from 'express';
import { ImpressaoController } from './impressao.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const rotasImpressao = Router();
const controller = new ImpressaoController();

rotasImpressao.use(verificarTokenMiddleware);
rotasImpressao.use(autorizarPorTipo(['master', 'funcionario']));

rotasImpressao.get('/pendentes', controller.listar);
rotasImpressao.patch('/:id/sucesso', controller.sucesso);
rotasImpressao.patch('/:id/falha', controller.falha);

export { rotasImpressao };
