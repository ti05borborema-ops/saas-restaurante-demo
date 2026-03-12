<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-orange-500 to-red-500">
          RestaurantePro
        </h1>
        <p class="mt-3 text-gray-500 font-medium">Bem-vindo de volta!</p>
      </div>

      <!-- Login Form Card -->
      <div class="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Campo Seleção de Usuário -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 ml-1">Funcionário</label>
            <button
              type="button"
              @click="showUserModal = true"
              class="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 border-2 border-transparent focus:border-orange-500 rounded-2xl transition-all group"
            >
              <div class="flex items-center gap-3">
                <div v-if="usuarioSelecionado" class="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {{ usuarioSelecionado.nome.charAt(0) }}
                </div>
                <div v-else class="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center">
                  <span class="material-icons text-lg">person</span>
                </div>
                <span :class="usuarioSelecionado ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium'">
                  {{ usuarioSelecionado ? usuarioSelecionado.nome : 'Clique para selecionar...' }}
                </span>
              </div>
              <span class="material-icons text-gray-400 group-hover:text-orange-500 transition-colors">expand_more</span>
            </button>
          </div>

          <!-- Campo Senha -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 ml-1">Senha de Acesso</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••"
              required
              class="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white focus:ring-0 rounded-2xl transition-all font-medium text-lg placeholder:text-gray-300"
            />
          </div>

          <!-- Erros -->
          <div v-if="loginError" class="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium text-center border border-red-100 animate-shake">
            {{ loginError }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoggingIn || !usuarioSelecionado"
            class="w-full bg-linear-to-r from-orange-500 to-red-500 hover:scale-[1.02] active:scale-[0.98] py-5 font-black text-white rounded-2xl shadow-xl shadow-orange-200 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {{ isLoggingIn ? 'Autenticando...' : 'Acessar Sistema' }}
          </button>
        </form>
      </div>

      <p class="text-center mt-8 text-gray-400 text-sm font-medium">
        RestaurantePro v1.0 • Operação Offline
      </p>
    </div>

    <!-- Modal de Seleção de Usuário -->
    <div v-if="showUserModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div class="p-10">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl font-black text-gray-900">Quem é você?</h2>
              <p class="text-gray-500 font-medium">Selecione seu nome na lista abaixo</p>
            </div>
            <button @click="showUserModal = false" class="text-gray-400 hover:text-gray-900 transition-colors">
              <span class="material-icons text-3xl">close</span>
            </button>
          </div>

          <div v-if="isLoadingUsuarios" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button
              v-for="user in usuarios"
              :key="user.id"
              @click="selecionarUsuario(user)"
              class="group p-6 bg-gray-50 hover:bg-orange-500 rounded-4xl border-2 border-transparent hover:border-orange-400 transition-all duration-300 flex flex-col items-center gap-4 text-center"
            >
              <div class="w-16 h-16 bg-white text-orange-500 rounded-full flex items-center justify-center text-2xl font-black group-hover:scale-110 transition-transform">
                {{ user.nome.charAt(0).toUpperCase() }}
              </div>
              <div class="transition-colors group-hover:text-white">
                <h3 class="font-bold text-gray-900 group-hover:text-white">{{ user.nome }}</h3>
                <span class="text-[10px] font-black uppercase tracking-widest opacity-60">
                  {{ user.tipo }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';

const usuarios = ref<any[]>([]);
const usuarioSelecionado = ref<any>(null);
const showUserModal = ref(false);
const password = ref('');
const loginError = ref('');
const isLoadingUsuarios = ref(true);
const isLoggingIn = ref(false);

const router = useRouter();
const authStore = useAuthStore();

const carregarUsuarios = async () => {
  try {
    const response = await api.get('/autenticacao/usuarios');
    usuarios.value = response.data;
  } catch (error) {
    loginError.value = 'Houve um problema de conexão com o servidor local.';
  } finally {
    isLoadingUsuarios.value = false;
  }
};

const selecionarUsuario = (user: any) => {
  usuarioSelecionado.value = user;
  showUserModal.value = false;
  loginError.value = '';
};

const handleLogin = async () => {
  if (!usuarioSelecionado.value || !password.value) return;
  
  loginError.value = '';
  isLoggingIn.value = true;
  try {
    await authStore.login(usuarioSelecionado.value.id, password.value);
    router.push('/dashboard');
  } catch (error: any) {
    loginError.value = error.message.includes('Senha') ? 'Senha incorreta. Tente novamente.' : error.message;
  } finally {
    isLoggingIn.value = false;
  }
};

onMounted(carregarUsuarios);
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
