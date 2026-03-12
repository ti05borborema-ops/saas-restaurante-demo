import axios from 'axios';

// Usa o mesmo host que o frontend está sendo acessado.
// Isso garante que funciona tanto no PC (localhost) quanto em
// celulares e tablets na rede local (pelo IP do servidor).
const backendUrl = import.meta.env.VITE_API_URL
  || (window.location.hostname === 'localhost' 
      ? `http://localhost:3000/api` 
      : `https://${window.location.hostname}/api`); // Fallback dinâmico para produção

const api = axios.create({
  baseURL: backendUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
