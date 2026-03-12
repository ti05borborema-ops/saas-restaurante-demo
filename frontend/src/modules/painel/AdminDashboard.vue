<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 class="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Visão Geral</h1>
      <div class="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{{ new Date().toLocaleDateString('pt-BR') }}</div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Faturamento Hoje</p>
          <p class="text-2xl font-black text-gray-900 mt-1">{{ formatCurrency(metrics.faturamentoHoje) }}</p>
        </div>
        <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex justify-center items-center text-xl">💰</div>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedidos Abertos</p>
          <p class="text-2xl font-black text-gray-900 mt-1">{{ metrics.pedidosAbertos }}</p>
        </div>
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex justify-center items-center text-xl">📦</div>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-green-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Mesas Ocupadas</p>
          <p class="text-2xl font-black text-gray-900 mt-1">{{ metrics.mesasOcupadas }} / {{ metrics.totalMesas }}</p>
        </div>
        <div class="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex justify-center items-center text-xl">🍽️</div>
      </div>
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Clientes Cadastrados</p>
          <p class="text-2xl font-black text-gray-900 mt-1">{{ metrics.clientesCadastrados }}</p>
        </div>
        <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex justify-center items-center text-xl">👥</div>
      </div>
    </div>

    <!-- Ações Rápidas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div class="relative z-10">
          <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <span class="material-icons text-white">receipt_long</span>
          </div>
          <h2 class="text-2xl font-black text-white mb-2">Auditoria Financeira</h2>
          <p class="text-gray-400 mb-6 max-w-sm">Acesse o relatório detalhado mesa a mesa e confira o fechamento de caixa.</p>
        </div>
        <router-link to="/admin/relatorios" class="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition w-fit backdrop-blur-md relative z-10">
          Acessar Relatório
        </router-link>
      </div>
      
      <div class="bg-white rounded-3xl shadow-sm p-8 border border-gray-100 flex flex-col justify-center items-center text-center">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <span class="material-icons text-gray-300 text-4xl">analytics</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800">Gráfico de Vendas</h3>
        <p class="text-gray-400 max-w-xs mt-2 text-sm">Em breve! Acompanhe o desempenho das suas vendas com gráficos mais detalhados.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const metrics = ref({
  faturamentoHoje: 0,
  pedidosAbertos: 0,
  mesasOcupadas: 0,
  totalMesas: 0,
  clientesCadastrados: 0
});

const getMetrics = async () => {
  try {
    const { data } = await api.get('/relatorios/dashboard');
    metrics.value = data;
  } catch (err) {
    console.error('Erro ao buscar dashboard:', err);
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

onMounted(() => {
  getMetrics();
});
</script>


