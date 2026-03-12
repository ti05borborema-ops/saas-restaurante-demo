import { Router } from 'express';
import { AutenticacaoController } from './autenticacao.controller';

const rotasAutenticacao = Router();
const controller = new AutenticacaoController();

rotasAutenticacao.get('/usuarios', controller.listarUsuarios);
rotasAutenticacao.post('/entrar', controller.login);

export { rotasAutenticacao };
