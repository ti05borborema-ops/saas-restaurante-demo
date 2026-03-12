import { Request, Response } from 'express';
import { CustomersService } from './customers.service';

const service = new CustomersService();

export class CustomersController {
  async listar(req: Request, res: Response) {
    const clientes = await service.listar();
    res.json(clientes);
  }

  async buscarPorId(req: Request, res: Response) {
    const id = req.params.id as string;
    const cliente = await service.buscarPorId(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  }

  async criar(req: Request, res: Response) {
    try {
      const cliente = await service.criar(req.body);
      res.status(201).json(cliente);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const cliente = await service.atualizar(id, req.body);
      res.json(cliente);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await service.excluir(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
