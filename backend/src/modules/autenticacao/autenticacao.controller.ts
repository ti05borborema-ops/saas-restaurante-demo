import { Request, Response } from 'express';
import { AutenticacaoService } from './autenticacao.service';

const autenticacaoService = new AutenticacaoService();

export class AutenticacaoController {
  async listarUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await autenticacaoService.listarUsuariosAtivos();
      return res.json(usuarios);
    } catch (erro: any) {
      console.error('[AutenticacaoController] Erro ao listar usuários:', erro);
      return res.status(500).json({ 
        erro: 'Erro ao listar usuários', 
        detalhes: erro.message 
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { usuario_id, senha } = req.body;

      if (!usuario_id || !senha) {
        return res.status(400).json({ erro: 'ID do usuário e senha são obrigatórios' });
      }

      const resultado = await autenticacaoService.login(usuario_id, senha);
      
      return res.json(resultado);
    } catch (erro: any) {
      if (erro.message.includes('incorreta') || erro.message.includes('não encontrado')) {
        return res.status(401).json({ erro: erro.message });
      }
      return res.status(500).json({ erro: 'Erro interno ao realizar login' });
    }
  }
}
