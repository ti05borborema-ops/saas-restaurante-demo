import { Request, Response } from 'express';
import { PedidosService, StatusPedido } from './pedidos.service';

const pedidosService = new PedidosService();

export class PedidosController {
  async listarDaMesa(req: Request, res: Response) {
    try {
      const { mesaId } = req.params;
      const pedidos = await pedidosService.listarPedidosDaMesa(mesaId as string);
      return res.json(pedidos);
    } catch (erro: any) {
      return res.status(500).json({ erro: 'Erro ao listar os pedidos da mesa' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { mesa_id, cliente_id } = req.body;
      if (!mesa_id) return res.status(400).json({ erro: 'O ID da mesa é obrigatório' });

      const pedido = await pedidosService.criarPedidoMesa(mesa_id, cliente_id);
      return res.status(201).json(pedido);
    } catch (erro: any) {
      if (erro.message.includes('andamento')) {
        return res.status(400).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Erro ao criar o pedido' });
    }
  }

  async adicionarItens(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { itens } = req.body;

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: 'A lista de itens não pode estar vazia' });
      }

      const itensAdicionados = await pedidosService.adicionarItens(id as string, itens);
      return res.status(201).json(itensAdicionados);
    } catch (erro: any) {
      if (erro.message.includes('não encontrado')) {
         return res.status(404).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Erro ao adicionar os itens na comanda' });
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) return res.status(400).json({ erro: 'O status é obrigatório' });

      const pedidoAtualizado = await pedidosService.atualizarStatusPedido(id as string, status as StatusPedido);
      return res.json(pedidoAtualizado);
    } catch (erro: any) {
      return res.status(500).json({ erro: erro.message || 'Erro ao atualizar o pedido' });
    }
  }

  async finalizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { pagamentos } = req.body;

      if (!pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
        return res.status(400).json({ erro: 'É necessário informar ao menos uma forma de pagamento' });
      }

      const resultado = await pedidosService.finalizarPedidoMesa(id as string, pagamentos);
      return res.json(resultado);
    } catch (erro: any) {
      console.error('Erro ao finalizar pedido:', erro);
      return res.status(400).json({ erro: erro.message || 'Erro ao finalizar o pedido' });
    }
  }
}
