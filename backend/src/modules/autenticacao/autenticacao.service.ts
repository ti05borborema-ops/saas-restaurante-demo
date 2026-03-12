import bcrypt from 'bcrypt';
import { query } from '../../database/connection';
import { gerarToken, TokenPayload } from '../../core/autenticacao';

export class AutenticacaoService {
  async listarUsuariosAtivos() {
    const res = await query('SELECT id, nome, tipo FROM usuarios WHERE ativo = true ORDER BY nome ASC');
    return res.rows;
  }

  async login(usuarioId: string, senhaPlana: string) {
    const res = await query('SELECT * FROM usuarios WHERE id = $1 AND ativo = true', [usuarioId]);
    
    if (res.rowCount === 0) {
      throw new Error('Usuário não encontrado ou inativo');
    }

    const usuario = res.rows[0];

    const senhaValida = await bcrypt.compare(senhaPlana, usuario.senha);
    if (!senhaValida) {
      throw new Error('Senha incorreta');
    }

    const payload: TokenPayload = {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo as TokenPayload['tipo']
    };

    const token = gerarToken(payload);

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      },
      token
    };
  }
}
