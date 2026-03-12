import { Request, Response } from 'express';
import { ImpressaoService } from './impressao.service';

const impressaoService = new ImpressaoService();

export class ImpressaoController {
  async listar(req: Request, res: Response) {
    try {
      const { setor } = req.query;
      const fila = await impressaoService.listarFilaPendentes(setor as string | undefined);
      return res.json(fila);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao buscar a fila de impressão' });
    }
  }

  async sucesso(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trabalho = await impressaoService.marcarComoImpresso(id as string);
      return res.json(trabalho);
    } catch (erro: any) {
      if (erro.message.includes('não encontrado')) return res.status(404).json({ erro: erro.message });
      return res.status(500).json({ erro: 'Erro ao confirmar impressão' });
    }
  }

  async falha(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trabalho = await impressaoService.registrarFalha(id as string);
      return res.json(trabalho);
    } catch (erro: any) {
      if (erro.message.includes('não encontrado')) return res.status(404).json({ erro: erro.message });
      return res.status(500).json({ erro: 'Erro ao registrar falha de impressão' });
    }
  }
}
