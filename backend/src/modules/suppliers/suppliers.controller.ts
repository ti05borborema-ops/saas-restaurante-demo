import { Request, Response } from 'express';
import { SuppliersService } from './suppliers.service';

const service = new SuppliersService();

export class SuppliersController {
  async listar(req: Request, res: Response) {
    const fornecedores = await service.listar();
    res.json(fornecedores);
  }

  async buscarPorId(req: Request, res: Response) {
    const id = req.params.id as string;
    const fornecedor = await service.buscarPorId(id);
    if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json(fornecedor);
  }

  async criar(req: Request, res: Response) {
    try {
      const fornecedor = await service.criar(req.body);
      res.status(201).json(fornecedor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const fornecedor = await service.atualizar(id, req.body);
      res.json(fornecedor);
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
