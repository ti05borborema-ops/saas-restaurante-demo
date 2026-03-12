import { Request, Response } from 'express';
import { DeliveryService, StatusDelivery } from './delivery.service';

const deliveryService = new DeliveryService();

export class DeliveryController {
  async listar(req: Request, res: Response) {
    try {
      const deliveries = await deliveryService.listarPedidos();
      return res.json(deliveries);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao buscar despachos de delivery' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { cliente_id, endereco } = req.body;
      if (!cliente_id || !endereco) {
        return res.status(400).json({ erro: 'O cliente e endereço são origatórios' });
      }

      const delivery = await deliveryService.criarPedidoDelivery(cliente_id, endereco);
      return res.status(201).json(delivery);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao gerar delivery' });
    }
  }

  async status(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ erro: 'Status ausente' });

      const atualizado = await deliveryService.atualizarStatus(id as string, status as StatusDelivery);
      return res.json(atualizado);
    } catch (erro: any) {
      return res.status(500).json({ erro: erro.message });
    }
  }
}
