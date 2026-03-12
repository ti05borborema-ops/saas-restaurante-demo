import { Router } from 'express';
import { ConfiguracoesController } from './configuracoes.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const rotasConfiguracoes = Router();
const controller = new ConfiguracoesController();

rotasConfiguracoes.use(verificarTokenMiddleware);
// Apenas Masters podem alterar configurações da loja
rotasConfiguracoes.use(autorizarPorTipo(['master']));

rotasConfiguracoes.get('/', controller.obter);
rotasConfiguracoes.patch('/', controller.atualizar);

export { rotasConfiguracoes };
