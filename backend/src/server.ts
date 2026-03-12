import http from 'http';
import os from 'os';
import app from './app';
import { inicializarWebSockets } from './websockets';

const PORTA = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Operar off-line em toda a rede local

const servidor = http.createServer(app);

// Inicializar ecossistema Real-Time traduzido
inicializarWebSockets(servidor);

function obterIPsDaRedeLocal(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const inter of interfaces[name]!) {
      if (inter.family === 'IPv4' && !inter.internal) {
        ips.push(inter.address);
      }
    }
  }
  return ips;
}

servidor.listen(PORTA as number, HOST, () => {
  console.log('=================================');
  console.log(`[RestaurantePro] Backend Iniciado!`);
  console.log(`Porta de comunicação: ${PORTA}`);
  
  const enderecos = obterIPsDaRedeLocal();
  console.log('--- Acesso na Rede Local ---');
  enderecos.forEach(ip => {
    console.log(`http://${ip}:${PORTA}`);
  });
  console.log('=================================');
});
