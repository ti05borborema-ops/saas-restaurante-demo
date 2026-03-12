import { Router } from 'express';
import { CardapioController } from './cardapio.controller';
import { verificarTokenMiddleware, autorizarPorTipo } from '../../core/autenticacao';

const rotasCardapio = Router();
const controller = new CardapioController();

rotasCardapio.use(verificarTokenMiddleware);

// Rotas de leitura liberadas para master e funcionários
rotasCardapio.get('/categorias', controller.listarCategorias);
rotasCardapio.get('/produtos', controller.listarProdutos);

// Restrito ao Master
rotasCardapio.post('/categorias', autorizarPorTipo(['master']), controller.criarCategoria);
rotasCardapio.post('/produtos', autorizarPorTipo(['master']), controller.criarProduto);
rotasCardapio.patch('/produtos/:id/disponibilidade', autorizarPorTipo(['master', 'funcionario']), controller.alternarDisponibilidadeProduto);

export { rotasCardapio };
