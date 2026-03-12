import { Request, Response } from 'express';
import { RelatoriosService } from './relatorios.service';

const relatoriosService = new RelatoriosService();

export class RelatoriosController {
  async auditoria(req: Request, res: Response) {
    try {
      const { inicio, fim } = req.query;
      const dados = await relatoriosService.auditoriaVendas(inicio as string, fim as string);
      res.json(dados);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async dashboardMetrics(req: Request, res: Response) {
    try {
      const data = await relatoriosService.getDashboardMetrics();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
