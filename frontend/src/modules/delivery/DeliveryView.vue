<template>
  <div class="h-dvh flex flex-col bg-gray-50 max-w-[1600px] mx-auto overflow-hidden">
    <!-- Header -->
    <header class="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-10 shrink-0">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-red-100 text-red-600 font-black rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-red-200">
          <span class="material-icons">delivery_dining</span>
        </div>
        <div>
          <h1 class="text-2xl font-black text-gray-900 leading-none">Gestão de Delivery</h1>
          <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Acompanhamento em Tempo Real</p>
        </div>
      </div>
      <div class="flex gap-3">
        <button 
          @click="router.push('/dashboard')" 
          class="px-5 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <span class="material-icons text-sm">storefront</span>
          <span class="hidden sm:inline">Mesas / Salão</span>
        </button>
        <button 
          @click="router.push('/delivery/novo')" 
          class="px-5 py-2.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center gap-2 uppercase tracking-wide text-sm"
        >
          <span class="material-icons text-sm">add</span>
          Novo Pedido
        </button>
      </div>
    </header>

    <!-- Kanban Board -->
    <div class="flex-1 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden p-4 md:p-6 mx-auto w-full">
      <div class="flex flex-col md:flex-row h-auto md:h-full gap-6 w-full">
        
        <!-- Coluna Pendente -->
        <div class="flex flex-col w-full md:flex-1 md:min-w-[280px] md:max-w-[400px] h-[450px] md:h-auto shrink-0 md:shrink bg-gray-100/50 rounded-3xl p-4 border border-gray-200/50">
          <div class="flex justify-between items-center mb-4 px-2">
            <h3 class="font-black text-gray-700 uppercase tracking-widest text-sm flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-red-500"></span> Pendente
            </h3>
            <span class="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{{ colPendente.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
            <DeliveryCard 
              v-for="d in colPendente" :key="d.delivery_id" :delivery="d"
              @action="avancarStatus(d.delivery_id, 'em_preparo')" 
              actionLabel="Preparar" actionColor="bg-yellow-500 hover:bg-yellow-600"
              @cancel="avancarStatus(d.delivery_id, 'cancelado')"
            />
          </div>
        </div>

        <!-- Coluna Em Preparo -->
        <div class="flex flex-col w-full md:flex-1 md:min-w-[280px] md:max-w-[400px] h-[450px] md:h-auto shrink-0 md:shrink bg-gray-100/50 rounded-3xl p-4 border border-gray-200/50">
          <div class="flex justify-between items-center mb-4 px-2">
            <h3 class="font-black text-gray-700 uppercase tracking-widest text-sm flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-yellow-500"></span> Preparando
            </h3>
            <span class="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{{ colPreparo.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
            <DeliveryCard 
              v-for="d in colPreparo" :key="d.delivery_id" :delivery="d"
              @action="avancarStatus(d.delivery_id, 'saiu_entrega')" 
              actionLabel="Despachar" actionColor="bg-blue-500 hover:bg-blue-600"
            />
          </div>
        </div>

        <!-- Coluna Saiu para Entrega -->
        <div class="flex flex-col w-full md:flex-1 md:min-w-[280px] md:max-w-[400px] h-[450px] md:h-auto shrink-0 md:shrink bg-gray-100/50 rounded-3xl p-4 border border-gray-200/50">
          <div class="flex justify-between items-center mb-4 px-2">
            <h3 class="font-black text-gray-700 uppercase tracking-widest text-sm flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span> A Caminho
            </h3>
            <span class="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{{ colEntrega.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
            <DeliveryCard 
              v-for="d in colEntrega" :key="d.delivery_id" :delivery="d"
              @action="openCheckout(d)" 
              actionLabel="Finalizar" actionColor="bg-emerald-500 hover:bg-emerald-600"
            />
          </div>
        </div>

        <!-- Coluna Concluídos / Recentes -->
        <div class="flex flex-col w-full md:flex-1 md:min-w-[280px] md:max-w-[400px] h-[450px] md:h-auto shrink-0 md:shrink bg-gray-100/50 rounded-3xl p-4 border border-gray-200/50 opacity-100 md:opacity-60 hover:opacity-100 transition-opacity">
          <div class="flex justify-between items-center mb-4 px-2">
            <h3 class="font-black text-gray-700 uppercase tracking-widest text-sm flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Concluídos Hoje
            </h3>
            <span class="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{{ colConcluidos.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
            <DeliveryCard 
              v-for="d in colConcluidos" :key="d.delivery_id" :delivery="d"
              :readOnly="true"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- Checkout Modal -->
    <div v-if="checkoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-black text-gray-900">Finalizar Entrega</h3>
          <button @click="checkoutModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <p class="text-sm font-bold text-gray-500 mb-2">Total a Pagar:</p>
        <p class="text-4xl font-black text-gray-900 mb-6">{{ formatCurrency(checkoutOrder?.total || 0) }}</p>

        <div class="space-y-4 mb-6">
          <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <label class="block text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Pagamento (Opcional - caso já não esteja pago)</label>
            <div class="flex gap-2">
              <select v-model="formaPagamento" class="flex-1 px-3 py-3 rounded-lg border border-emerald-200 bg-white font-bold outline-none focus:ring-2 focus:ring-emerald-200">
                <option value="Dinheiro">Dinheiro</option>
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
              </select>
            </div>
            <p class="text-[10px] text-emerald-600/70 mt-2 font-bold uppercase leading-tight">
              O valor total será lançado no relatório financeiro sob esta forma de pagamento.
            </p>
          </div>
        </div>

        <button 
          @click="finalizarDelivery"
          :disabled="isFinishing"
          class="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition tracking-widest uppercase disabled:opacity-50"
        >
          {{ isFinishing ? 'Finalizando...' : 'Confirmar Pagamento e Finalizar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import DeliveryCard from './components/DeliveryCard.vue';

const router = useRouter();
const deliveries = ref<any[]>([]);

const checkoutModal = ref(false);
const checkoutOrder = ref<any>(null);
const formaPagamento = ref('Dinheiro');
const isFinishing = ref(false);

const loadDeliveries = async () => {
  try {
    const { data } = await api.get('/delivery');
    deliveries.value = data;
  } catch (err) {
    console.error('Erro ao buscar deliveries', err);
  }
};

const formatCurrency = (val: number | string) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
};

// Computed columns
const colPendente = computed(() => deliveries.value.filter(d => d.status_delivery === 'pendente'));
const colPreparo = computed(() => deliveries.value.filter(d => d.status_delivery === 'em_preparo'));
const colEntrega = computed(() => deliveries.value.filter(d => d.status_delivery === 'saiu_entrega'));
// Exibe concluidos apenas do dia atual para não poluir
const colConcluidos = computed(() => deliveries.value.filter(d => {
  if (d.status_delivery !== 'entregue' && d.status_delivery !== 'cancelado') return false;
  // Regra básica: mostrar até 50 mais recentes independentemente da data para simplificar
  return true;
}).slice(0, 30));

const avancarStatus = async (id: string, status: string) => {
  try {
    const { data } = await api.patch(`/delivery/${id}/status`, { status });
    // Update local state smoothly (websocket will override soon anyway)
    const idx = deliveries.value.findIndex(d => d.delivery_id === id);
    if (idx !== -1) deliveries.value[idx].status_delivery = data.status;
  } catch (err) {
    alert('Erro ao alterar status');
  }
};

const openCheckout = (delivery: any) => {
  checkoutOrder.value = delivery;
  checkoutModal.value = true;
};

const finalizarDelivery = async () => {
  if (!checkoutOrder.value || isFinishing.value) return;
  isFinishing.value = true;
  try {
    // 1. Lança pagamento via Pedido ID
    await api.post(`/pedidos/${checkoutOrder.value.pedido_id}/finalizar`, {
      pagamentos: [{ forma: formaPagamento.value, valor: Number(checkoutOrder.value.total) }]
    });

    // 2. Altera status_delivery para entregue
    await avancarStatus(checkoutOrder.value.delivery_id, 'entregue');

    checkoutModal.value = false;
    alert('Entrega finalizada com sucesso!');
  } catch (err) {
    alert('Erro ao finalizar entrega');
  } finally {
    isFinishing.value = false;
  }
};

onMounted(() => {
  loadDeliveries();
  const socket = getSocket();
  if (socket) {
    socket.on('pedido_delivery_criado', () => loadDeliveries());
    socket.on('status_delivery_alterado', () => loadDeliveries());
  }
});

onUnmounted(() => {
  const socket = getSocket();
  if (socket) {
    socket.off('pedido_delivery_criado');
    socket.off('status_delivery_alterado');
  }
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
