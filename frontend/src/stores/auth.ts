import { defineStore } from 'pinia';
import api from '../services/api';
import { getSocket, initSocket } from '../services/socket';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'master' | 'funcionario' | 'cliente';
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(usuario_id: string, senha: string) {
      try {
        const response = await api.post('/autenticacao/entrar', { usuario_id, senha });
        const { usuario, token } = response.data;

        this.user = usuario;
        this.token = token;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        initSocket(token);
      } catch (error: any) {
        throw new Error(error.response?.data?.erro || 'Erro ao realizar login');
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const socket = getSocket();
      if (socket) socket.disconnect();
    },
    loadUser() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    isMaster: (state) => state.user?.tipo === 'master',
    isStaff: (state) => state.user?.tipo === 'funcionario' || state.user?.tipo === 'master',
  }
});
