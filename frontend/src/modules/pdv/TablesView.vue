<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto min-h-dvh">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 md:p-6 rounded-3xl md:rounded-4xl shadow-sm border border-gray-100 w-full overflow-hidden">
      <div class="flex items-center gap-3 w-full sm:w-auto min-w-0">
        <div class="w-10 h-10 md:w-12 md:h-12 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-orange-200 shrink-0">
          {{ authStore.user?.nome.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-lg md:text-2xl font-black text-gray-900 leading-tight truncate">Olá, {{ authStore.user?.nome }}</h1>
          <p class="text-[9px] md:text-xs font-bold text-gray-400 border-l-2 border-orange-500 pl-2 uppercase tracking-widest italic">Operando POS</p>
        </div>
      </div>
      
      <div class="flex w-full sm:w-auto gap-3">
        <button 
          @click="router.push('/delivery')" 
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all border border-red-100 text-sm"
        >
          <span class="material-icons text-sm">delivery_dining</span>
          <span class="hidden xs:inline">Delivery</span>
        </button>
        <button 
          v-if="authStore.isMaster"
          @click="router.push('/admin')" 
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-orange-50 text-orange-600 font-bold rounded-xl hover:bg-orange-100 transition-all border border-orange-100 text-sm"
        >
          <span class="material-icons text-sm">settings</span>
          <span class="hidden xs:inline">Painel Admin</span>
          <span class="xs:hidden">Admin</span>
        </button>
        <button 
          @click="logout" 
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-gray-50 text-gray-400 font-bold rounded-xl hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 text-sm"
        >
          <span class="material-icons text-sm">logout</span>
          Sair
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500">Carregando mesas...</p>
    </div>
    
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <div 
        v-for="table in tables" 
        :key="table.id"
        @click="openTable(table.id)"
        class="bg-white rounded-2xl p-6 shadow-sm border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md flex flex-col items-center justify-center min-h-[140px]"
        :class="{
          'border-green-500 bg-green-50/30': table.status === 'livre',
          'border-red-500 bg-red-50/30': table.status === 'ocupada',
          'border-yellow-500 bg-yellow-50/30': table.status === 'aguardando_pagamento'
        }"
      >
        <span class="text-4xl font-black mb-2" :class="{
          'text-green-600': table.status === 'livre',
          'text-red-600': table.status === 'ocupada',
          'text-yellow-600': table.status === 'aguardando_pagamento'
        }">
          {{ table.numero }}
        </span>
        <span class="text-xs font-semibold uppercase tracking-wider" :class="{
          'text-green-600': table.status === 'livre',
          'text-red-600': table.status === 'ocupada',
          'text-yellow-600': table.status === 'aguardando_pagamento'
        }">
          {{ formatStatus(table.status) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const router = useRouter();
const authStore = useAuthStore();
const tables = ref<any[]>([]);
const loading = ref(true);

const fetchTables = async () => {
  try {
    const { data } = await api.get('/mesas');
    tables.value = data;
  } catch (error) {
    console.error('Erro ao buscar mesas:', error);
  } finally {
    loading.value = false;
  }
};

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    livre: 'Livre',
    ocupada: 'Ocupada',
    aguardando_pagamento: 'Aguar. Pagamento'
  };
  return statusMap[status] || status;
};

const openTable = (id: string) => {
  router.push(`/table/${id}`);
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

let socket: any;

onMounted(() => {
  fetchTables();
  
  socket = getSocket();
  if (socket) {
    socket.emit('join-staff-room');
    
    socket.on('mesa_status_alterado', (updatedTable: any) => {
      const idx = tables.value.findIndex(t => t.id === updatedTable.id);
      if (idx !== -1) {
        tables.value[idx].status = updatedTable.status;
      }
    });

    socket.on('pedido_criado', () => {
       // Opcional: recarregar mesas
    });
  }
});

onUnmounted(() => {
  if (socket) {
    socket.off('mesa_status_alterado');
    socket.off('pedido_criado');
  }
});
</script>
