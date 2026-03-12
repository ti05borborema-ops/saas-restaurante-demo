import { Request, Response } from 'express';
import { CardapioService } from './cardapio.service';

const cardapioService = new CardapioService();

export class CardapioController {
  // Categorias
  async listarCategorias(req: Request, res: Response) {
    try {
      const categorias = await cardapioService.listarCategorias();
      return res.json(categorias);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao listar categorias' });
    }
  }

  async criarCategoria(req: Request, res: Response) {
    try {
      const { nome } = req.body;
      if (!nome) return res.status(400).json({ erro: 'O nome da categoria é obrigatório' });
      
      const categoria = await cardapioService.criarCategoria(nome);
      return res.status(201).json(categoria);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao criar categoria' });
    }
  }

  // Produtos
  async listarProdutos(req: Request, res: Response) {
    try {
      const apenasAtivos = req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined;
      const produtos = await cardapioService.listarProdutos(apenasAtivos);
      return res.json(produtos);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao listar produtos' });
    }
  }

  async criarProduto(req: Request, res: Response) {
    try {
      const { nome, preco, categoria_id, descricao, setor } = req.body;
      if (!nome || !preco || !categoria_id) {
        return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios' });
      }

      const produto = await cardapioService.criarProduto({ nome, preco, categoria_id, descricao, setor });
      return res.status(201).json(produto);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao criar produto' });
    }
  }

  async alternarDisponibilidadeProduto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      if (typeof ativo !== 'boolean') {
        return res.status(400).json({ erro: 'O status ativo (booleano) é obrigatório' });
      }

      const produto = await cardapioService.alternarDisponibilidadeProduto(id as string, ativo);
      return res.json(produto);
    } catch (erro: any) {
      if (erro.message.includes('não encontrado')) {
        return res.status(404).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Erro ao alternar disponibilidade' });
    }
  }
}
