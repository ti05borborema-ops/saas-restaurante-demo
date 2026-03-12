<template>
  <div class="h-dvh flex flex-col bg-gray-50 max-w-[1600px] mx-auto overflow-hidden">
    <!-- Header -->
    <header class="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
      <div class="flex items-center gap-4">
        <button @click="router.push('/delivery')" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
          <span class="material-icons">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-black text-gray-900 leading-none">Novo Delivery</h1>
          <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Selecione cliente e produtos</p>
        </div>
      </div>
    </header>

    <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
      <!-- MAIN: Esquerda (Busca Cliente & Cardápio) -->
      <main class="flex-1 flex flex-col h-full bg-gray-50 p-4 md:p-6 overflow-hidden">
        
        <!-- Bloco de Seleção de Cliente -->
        <div class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 shrink-0 z-10 relative">
          <div v-if="selectedClient" class="flex justify-between items-center p-2">
            <div>
              <h3 class="font-black text-gray-900 flex items-center gap-2">
                <span class="material-icons text-red-500 text-lg">person</span> {{ selectedClient.nome }}
              </h3>
              <p class="text-xs text-gray-500 font-medium">{{ selectedClient.telefone }}</p>
            </div>
            <button @click="selectedClient = null" class="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 font-bold rounded-lg hover:bg-gray-200">Trocar Cliente</button>
          </div>
          
          <div v-else>
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Buscar Cliente</label>
            <input 
              v-model="searchClient"
              type="text" 
              placeholder="Digite o nome ou telefone..." 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition font-medium"
            >
            <div v-if="filteredClients.length > 0 && searchClient" class="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 max-h-48 overflow-y-auto">
              <button 
                v-for="c in filteredClients" :key="c.id"
                @click="selectClient(c)"
                class="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-gray-50 transition"
              >
                <p class="font-bold text-gray-900">{{ c.nome }}</p>
                <p class="text-[10px] text-gray-500">{{ c.telefone }}</p>
              </button>
            </div>
          </div>
          
          <!-- Endereço Temporário do Delivery -->
          <div v-if="selectedClient" class="mt-4 pt-4 border-t border-gray-100">
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Endereço de Entrega</label>
            <textarea 
              v-model="deliveryAddress"
              rows="2"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-100 text-sm font-medium rounded-xl focus:border-red-500 outline-none"
              placeholder="Ex: Rua das Flores, 123, Bairro Centro"
            ></textarea>
          </div>
        </div>

        <!-- Bloco do Cardápio -->
        <div class="flex-1 overflow-y-auto pr-2 scrollbar-hide">
          <h3 class="font-black text-gray-900 mb-4 px-1 flex justify-between items-center">
            Adicionar Produtos
            <select v-model="selectedCategory" class="bg-white border flex-none border-gray-200 px-3 py-1 rounded-lg text-xs outline-none">
              <option :value="null">Todas Categorias</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nome }}</option>
            </select>
          </h3>
          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button 
              v-for="p in filteredProducts" 
              :key="p.id" 
              @click="addToCart(p)"
              class="bg-white rounded-2xl p-4 shadow-xs border relative border-gray-100 text-left hover:border-red-500 hover:shadow-lg transition-all active:scale-95 group"
            >
              <div class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold mb-3 group-hover:-translate-y-1 transition-transform">
                {{ p.nome.charAt(0).toUpperCase() }}
              </div>
              <h3 class="font-bold text-gray-900 text-sm leading-tight mb-1">{{ p.nome }}</h3>
              <p class="font-black text-red-500">{{ formatCurrency(p.preco) }}</p>
            </button>
          </div>
        </div>
      </main>

      <!-- SIDEBAR: Resumo do Pedido -->
      <aside class="w-full md:w-[380px] bg-white border-t md:border-t-0 md:border-l border-gray-100 flex flex-col shrink-0 h-1/2 md:h-full">
        <div class="p-6 border-b border-gray-100 flex-none">
          <h2 class="text-xl font-black text-gray-900">Resumo da Entrega</h2>
        </div>

        <div class="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-center opacity-50">
            <span class="material-icons text-6xl text-gray-300 mb-2">shopping_bag</span>
            <p class="font-bold text-gray-500">Carrinho Vazio</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="(item, idx) in cart" :key="idx" class="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl relative group">
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm text-gray-900 truncate">{{ item.product.nome }}</p>
                <div class="flex gap-2">
                  <p class="text-xs font-black text-red-500">{{ formatCurrency(item.product.preco) }}</p>
                  <p v-if="item.notes" class="text-[10px] text-gray-400 italic truncate flex-1">{{ item.notes }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200">
                <button @click="updateQty(idx, -1)" class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md font-bold transition">-</button>
                <span class="font-black text-gray-700 w-4 text-center text-sm">{{ item.quantity }}</span>
                <button @click="updateQty(idx, 1)" class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md font-bold transition">+</button>
              </div>

              <button @click="removeFromCart(idx)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm">
                <span class="material-icons text-[14px]">close</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Checkout Bottom Area -->
        <div class="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0 z-10">
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm font-black text-gray-400 uppercase tracking-widest">Total Produtos</span>
            <span class="text-2xl font-black text-gray-900">{{ formatCurrency(cartTotal) }}</span>
          </div>
          
          <button 
            @click="sendDelivery"
            :disabled="isSending || cart.length === 0 || !selectedClient || !deliveryAddress"
            class="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            <span class="material-icons text-sm">send</span>
            {{ isSending ? 'Gerando...' : 'Confirmar e Enviar' }}
          </button>
          <p v-if="!selectedClient" class="text-center text-[10px] font-bold text-red-400 mt-2">
            Selecione o Cliente
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const router = useRouter();

// Arrays brutos API
const categories = ref<any[]>([]);
const products = ref<any[]>([]);
const clients = ref<any[]>([]);

// Seleção Delivery
const selectedClient = ref<any>(null);
const searchClient = ref('');
const deliveryAddress = ref('');

// Seleção Produtos
const selectedCategory = ref<string | null>(null);
const cart = ref<{ product: any, quantity: number, notes?: string }[]>([]);
const isSending = ref(false);

const filteredClients = computed(() => {
  if (!searchClient.value) return [];
  const query = searchClient.value.toLowerCase();
  return clients.value.filter(c => 
    c.nome.toLowerCase().includes(query) || 
    (c.telefone && c.telefone.includes(query))
  );
});

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter(p => p.categoria_id === selectedCategory.value);
});

const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + (item.product.preco * item.quantity), 0);
});

const formatCurrency = (val: number | string) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
};

// Funções DB
const loadBasicData = async () => {
  try {
    const [catRes, prodRes, cliRes] = await Promise.all([
      api.get('/cardapio/categorias'),
      api.get('/cardapio/produtos'),
      api.get('/clientes')
    ]);
    categories.value = catRes.data;
    products.value = prodRes.data;
    clients.value = cliRes.data;
  } catch (err) {
    console.error('Falha carregando DB', err);
  }
};

const selectClient = (cli: any) => {
  selectedClient.value = cli;
  searchClient.value = '';
  // Sugere o endereço salvo no banco (depende da estrutura exata, fallback genérico ou vazio)
  deliveryAddress.value = cli.telefone ? `Telefone de contato: ${cli.telefone}` : '';
};

// Carrinho
const addToCart = (product: any) => {
  const existingIndex = cart.value.findIndex(item => item.product.id === product.id);
  if (existingIndex >= 0 && cart.value[existingIndex]) {
    cart.value[existingIndex].quantity += 1;
  } else {
    cart.value.push({ product, quantity: 1, notes: '' });
  }
};

const updateQty = (index: number, delta: number) => {
  const item = cart.value[index];
  if (!item) return;

  if (item.quantity + delta > 0) {
    item.quantity += delta;
  } else {
    removeFromCart(index);
  }
};

const removeFromCart = (index: number) => {
  cart.value.splice(index, 1);
};

const sendDelivery = async () => {
  if (cart.value.length === 0 || !selectedClient.value || !deliveryAddress.value) return;
  isSending.value = true;
  
  try {
    // 1. Cria a Entidade Delivery/Pedido
    const { data: delivery } = await api.post('/delivery', {
      cliente_id: selectedClient.value.id,
      endereco: deliveryAddress.value
    });

    // 2. Insere os Itens no Pedido que o Delivery encapsulou
    const itemsPayload = cart.value.map(item => ({
      produto_id: item.product.id,
      quantidade: item.quantity,
      preco_unitario: item.product.preco,
      observacao: item.notes || null
    }));
    await api.post(`/pedidos/${delivery.pedido_id}/itens`, { itens: itemsPayload });
    
    // Sucesso, volta pro Kanban
    router.push('/delivery');
  } catch (err) {
    alert('Erro ao enviar pedido de entrega.');
  } finally {
    isSending.value = false;
  }
};

onMounted(() => {
  loadBasicData();
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
