import { Request, Response } from 'express';
import { UsersService } from './users.service';

const usersService = new UsersService();

export class UsersController {
  async listar(req: Request, res: Response) {
    try {
      const usuarios = await usersService.listarTodos();
      res.json(usuarios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const usuario = await usersService.criar(req.body);
      res.status(201).json(usuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const usuario = await usersService.atualizar(req.params.id as string, req.body);
      res.json(usuario);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      await usersService.deletar(req.params.id as string);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
