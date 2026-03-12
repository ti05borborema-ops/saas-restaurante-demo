import http from 'http';
import os from 'os';
import app from './app';
import { inicializarWebSockets } from './websockets';

const PORTA = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Operar off-line em toda a rede local

console.log('[Server] Inicializando servidor HTTP...');
const servidor = http.createServer(app);

try {
  console.log('[Server] Inicializando WebSockets...');
  inicializarWebSockets(servidor);
} catch (err) {
  console.error('[Server] ERRO ao inicializar WebSockets:', err);
}

function obterIPsDaRedeLocal(): string[] {
  try {
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
  } catch (err) {
    console.error('[Server] Erro ao carregar interfaces de rede:', err);
    return [];
  }
}

console.log('[Server] Tentando escutar na porta:', PORTA);
servidor.listen(Number(PORTA), HOST, () => {
  console.log('=================================');
  console.log(`[RestaurantePro] Backend Online!`);
  console.log(`Porta: ${PORTA} | Host: ${HOST}`);
  
  if (process.env.NODE_ENV !== 'production') {
    const enderecos = obterIPsDaRedeLocal();
    console.log('--- IPs locais detectados ---');
    enderecos.forEach(ip => console.log(`http://${ip}:${PORTA}`));
  }
  console.log('=================================');
});

servidor.on('error', (err) => {
  console.error('[Server] ERRO FATAL no servidor HTTP:', err);
  process.exit(1);
});
