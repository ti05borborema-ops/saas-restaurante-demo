import { Request, Response } from 'express';
import { FinanceiroService } from './financeiro.service';

const financeiroService = new FinanceiroService();

export class FinanceiroController {
  async registrar(req: Request, res: Response) {
    try {
      const { pedido_id, forma_pagamento, valor } = req.body;
      if (!pedido_id || !forma_pagamento || valor === undefined) {
         return res.status(400).json({ erro: 'Dados incompletos para faturamento' });
      }

      const receita = await financeiroService.registrarReceita(pedido_id, forma_pagamento, valor);
      return res.status(201).json(receita);
    } catch (erro: any) {
      if (erro.message.includes('não existe')) return res.status(404).json({ erro: erro.message });
      return res.status(500).json({ erro: 'Erro ao registrar faturamento' });
    }
  }

  async diario(req: Request, res: Response) {
    try {
      let data = req.query.data as string;
      if (!data) {
        // Usa hoje (UTC timezone local)
        data = new Date().toISOString().split('T')[0];
      }
      const relatorio = await financeiroService.relatorioDiario(data);
      return res.json(relatorio);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao gerar relatório diário' });
    }
  }

  async mensal(req: Request, res: Response) {
    try {
      const { mes } = req.query; // YYYY-MM
      if (!mes) return res.status(400).json({ erro: 'O parâmetro mes (YYYY-MM) é obrigatório' });

      const relatorio = await financeiroService.relatorioMensal(mes as string);
      return res.json(relatorio);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao gerar relatório mensal' });
    }
  }
}
