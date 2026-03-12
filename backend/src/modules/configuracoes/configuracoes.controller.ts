import { Request, Response } from 'express';
import { ConfiguracoesService } from './configuracoes.service';

const configuracoesService = new ConfiguracoesService();

export class ConfiguracoesController {
  async obter(req: Request, res: Response) {
    try {
      const config = await configuracoesService.obterConfiguracao();
      return res.json(config);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao buscar configurações do sistema' });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const configuracoes = await configuracoesService.atualizarConfiguracao(req.body);
      return res.json(configuracoes);
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao atualizar configurações' });
    }
  }
}
