import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token?: string) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000', {
      auth: { token },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }
  return socket;
};

export const getSocket = () => socket;
