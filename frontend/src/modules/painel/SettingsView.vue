<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-black text-gray-900">Configurações</h1>
      <p class="text-gray-500">Ajuste as preferências gerais do seu estabelecimento</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Nome e Dados Gerais -->
      <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 class="text-xl font-bold text-gray-800">Dados do Restaurante</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Nome Fantasia</label>
            <input 
              v-model="config.nome_restaurante" 
              type="text" 
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              placeholder="Ex: RestaurantePro Premium"
            >
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Quantidade de Mesas</label>
            <div class="flex items-center gap-4">
              <input 
                v-model.number="config.quantidade_mesas" 
                type="number" 
                min="1" 
                max="100"
                class="w-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              >
              <p class="text-xs text-gray-400 italic font-medium">O sistema criará ou removerá mesas automaticamente.</p>
            </div>
          </div>
        </div>

        <button 
          @click="saveConfig" 
          :disabled="loading"
          class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-xl"
        >
          {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>

      <!-- Informações do Sistema -->
      <div class="bg-orange-500 p-8 rounded-3xl text-white shadow-xl shadow-orange-200 flex flex-col justify-between">
        <div>
          <h3 class="text-2xl font-black mb-2 tracking-tight">Status do Plano</h3>
          <p class="text-orange-100 font-medium">SaaS Restaurant - Assinatura Ativa</p>
        </div>
        
        <div class="mt-8 space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-orange-400">
            <span class="text-sm font-bold">Banco de Dados</span>
            <span class="text-sm">Conectado</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-orange-400">
            <span class="text-sm font-bold">WebSockets (Realtime)</span>
            <span class="text-sm">Ativo</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-orange-400">
            <span class="text-sm font-bold">Fila de Impressão</span>
            <span class="text-sm">Operacional</span>
          </div>
        </div>

        <div class="mt-8 bg-white/10 p-4 rounded-2xl border border-white/20">
          <p class="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Dica Premium</p>
          <p class="text-sm leading-relaxed">Sempre verifique se a quantidade de mesas corresponde ao seu layout físico de mesas.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const config = ref({
  nome_restaurante: '',
  quantidade_mesas: 10
});
const loading = ref(false);

const loadConfig = async () => {
  try {
    const { data } = await api.get('/configuracoes');
    config.value = data;
  } catch (error) {
    console.error('Erro ao carregar configuracoes', error);
  }
};

const saveConfig = async () => {
  loading.value = true;
  try {
    await api.put('/configuracoes', config.value);
    alert('Configurações salvas com sucesso!');
  } catch (error) {
    alert('Erro ao salvar configurações');
  } finally {
    loading.value = false;
  }
};

onMounted(loadConfig);
</script>
