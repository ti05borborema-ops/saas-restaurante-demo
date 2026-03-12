<template>
  <div class="space-y-6">
    <!-- Cabeçalho com Filtros -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Auditoria de Vendas</h1>
        <p class="text-sm text-gray-500">Relatório detalhado mesa por mesa para conferência financeira</p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <div class="flex-1 sm:w-44">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Início</label>
          <input v-model="filtros.inicio" type="date" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm font-bold">
        </div>
        <div class="flex-1 sm:w-44">
          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Fim</label>
          <input v-model="filtros.fim" type="date" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-sm font-bold">
        </div>
        <button 
          @click="loadRelatorio"
          class="sm:mt-5 bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
        >
          <span class="material-icons text-sm">filter_list</span>
          Filtrar
        </button>
      </div>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total de Vendas</p>
        <p class="text-3xl font-black text-gray-900">{{ reportData.length }}</p>
      </div>
      <div class="bg-gray-900 p-6 rounded-3xl shadow-xl text-white">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faturamento Bruto</p>
        <p class="text-3xl font-black text-emerald-400">{{ formatCurrency(totalFaturado) }}</p>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket Médio</p>
        <p class="text-3xl font-black text-gray-900">{{ formatCurrency(ticketMedio) }}</p>
      </div>
    </div>

    <!-- Tabela de Auditoria -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left min-w-[900px]">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Mesa</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Data/Hora</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Itens Consumidos</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Pagamentos</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="venda in reportData" :key="venda.pedido_id" class="hover:bg-gray-50/50 transition">
              <td class="px-6 py-4 text-center">
                <span class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black mx-auto">
                  {{ venda.mesa_numero }}
                </span>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-gray-900">{{ formatDate(venda.data) }}</p>
                <p class="text-[10px] font-bold text-gray-400 uppercase">{{ formatTime(venda.data) }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <p v-for="it in venda.itens" :key="it.item_id" class="text-xs text-gray-600 truncate font-medium">
                    <span class="font-bold text-gray-400">{{ it.quantidade }}x</span> {{ it.produto }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(pg, i) in venda.pagamentos" :key="i" class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase tracking-tighter">
                    {{ pg.forma }}: {{ formatCurrency(pg.valor) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <span class="text-lg font-black text-gray-900">{{ formatCurrency(venda.total) }}</span>
              </td>
            </tr>
            <tr v-if="reportData.length === 0">
              <td colspan="5" class="px-6 py-20 text-center">
                <div class="flex flex-col items-center gap-2">
                  <span class="material-icons text-gray-200 text-6xl">analytics</span>
                  <p class="text-gray-400 font-bold">Nenhum dado encontrado para este período</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';

const reportData = ref<any[]>([]);
const filtros = ref({
  inicio: new Date().toISOString().split('T')[0],
  fim: new Date().toISOString().split('T')[0]
});

const loadRelatorio = async () => {
  try {
    const { data } = await api.get('/relatorios/auditoria', {
      params: {
        inicio: `${filtros.value.inicio} 00:00:00`,
        fim: `${filtros.value.fim} 23:59:59`
      }
    });
    reportData.value = data;
  } catch (error) {
    console.error('Erro ao carregar auditoria:', error);
  }
};

const totalFaturado = computed(() => {
  return reportData.value.reduce((acc, curr) => {
    const val = parseFloat(curr.total);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
});

const ticketMedio = computed(() => {
  if (reportData.value.length === 0) return 0;
  return totalFaturado.value / reportData.value.length;
});

const formatCurrency = (val: number | string) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(loadRelatorio);
</script>
