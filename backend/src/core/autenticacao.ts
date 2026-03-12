import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pos_key_2024';

// Renomeando interface para o escopo RestaurantePro
export interface TokenPayload {
  id: string;
  email: string;
  tipo: 'master' | 'funcionario' | 'cliente';
}

// Estendendo o Request do Express para incluir o "usuario" autenticado
declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export const gerarToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
};

export const verificarTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const cabecalhoAuth = req.headers.authorization;

  if (!cabecalhoAuth) {
    return res.status(401).json({ erro: 'Token não providenciado' });
  }

  const [, token] = cabecalhoAuth.split(' ');

  try {
    const payloadDecodificado = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.usuario = payloadDecodificado;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

export const autorizarPorTipo = (tiposPermitidos: Array<'master' | 'funcionario' | 'cliente'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    if (!tiposPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({ erro: 'Acesso negado para este nível de usuário' });
    }

    next();
  };
};
