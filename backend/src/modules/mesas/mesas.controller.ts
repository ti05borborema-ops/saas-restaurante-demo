import { Request, Response } from 'express';
import { MesasService, StatusMesa } from './mesas.service';

const mesasService = new MesasService();

export class MesasController {
  async listar(req: Request, res: Response) {
    try {
      const mesas = await mesasService.listarTodas();
      return res.json(mesas);
    } catch (erro: any) {
      return res.status(500).json({ erro: 'Erro ao listar mesas' });
    }
  }

  async buscar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mesa = await mesasService.buscarPorId(id as string);
      return res.json(mesa);
    } catch (erro: any) {
      if (erro.message.includes('não encontrada')) {
        return res.status(404).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Erro ao buscar mesa' });
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, cliente_nome } = req.body;

      if (!status) {
        return res.status(400).json({ erro: 'O status é obrigatório' });
      }

      const mesa = await mesasService.atualizarStatus(id as string, status as StatusMesa, cliente_nome);
      return res.json(mesa);
    } catch (erro: any) {
       return res.status(500).json({ erro: erro.message || 'Erro ao atualizar status da mesa' });
    }
  }
}
