import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pos_key_2024';

let io: SocketIOServer;

export const inicializarWebSockets = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Ideal pointar para a URL do frontend em prod
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.use((socket: any, next: any) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Autenticação WebSocket Requerida'));

    try {
      const payloadDecodificado = jwt.verify(token, JWT_SECRET);
      (socket as any).usuario = payloadDecodificado;
      next();
    } catch (err) {
      next(new Error('Token WebSocket Inválido'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WS] Cliente conectado: ${socket.id}`);

    // Garçons, cozinha ou gerentes entram na sala da equipe
    socket.on('join-staff-room', () => {
      socket.join('staff-room');
      console.log(`[WS] Socket ${socket.id} entrou na sala: staff-room`);
    });

    // Quando o garçom entra na tela de uma mesa específica
    socket.on('join-mesa', (mesaId: string) => {
      const nomeSala = `mesa-${mesaId}`;
      socket.join(nomeSala);
      console.log(`[WS] Socket ${socket.id} escutando mesa: ${nomeSala}`);
    });

    // Sair da tela da mesa (economia de broadcast)
    socket.on('leave-mesa', (mesaId: string) => {
      socket.leave(`mesa-${mesaId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Cliente desconectado: ${socket.id}`);
    });
  });
};

/**
 * Emite um evento global
 */
export const emitirEvento = (evento: string, dados: any) => {
  if (io) {
    io.emit(evento, dados);
  }
};

/**
 * Emite um evento para uma sala específica
 */
export const emitirParaSala = (sala: string, evento: string, dados: any) => {
  if (io) {
    io.to(sala).emit(evento, dados);
  }
};
