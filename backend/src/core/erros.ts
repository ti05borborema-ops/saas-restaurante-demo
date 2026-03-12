import { Request, Response, NextFunction } from 'express';

// Middleware global para captura de erros e padronização da resposta em português
export const manipuladorErros = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Erro Interno]', err.message);

  res.status(500).json({
    erro: 'Erro interno no servidor',
    mensagem: err.message || 'Contate o suporte técnico.',
  });
};
