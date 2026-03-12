<template>
  <div class="h-dvh w-full flex flex-col md:flex-row bg-gray-50 overflow-hidden relative">
    
    <!-- Lado Esquerdo: Cardápio -->
    <div class="flex-1 flex flex-col h-full overflow-hidden border-r">
      <div class="p-4 bg-white shadow-sm flex items-center justify-between w-full overflow-hidden">
        <button @click="router.back()" class="p-2 text-gray-500 hover:text-gray-800 shrink-0">
          <span class="material-icons">arrow_back</span>
        </button>
        <h2 class="text-lg font-black truncate px-2 text-center flex-1 min-w-0">Mesa {{ mesaNumero || '...' }}</h2>
        <div class="w-10 shrink-0"></div> 
      </div>
      
      <!-- Filtros de Categoria -->
      <div class="p-4 bg-white border-t border-b overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          @click="selectedCategory = null"
          class="px-4 py-2 mr-2 rounded-full text-sm font-medium transition"
          :class="!selectedCategory ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          Todos
        </button>
        <button 
          v-for="cat in categories" :key="cat.id"
          @click="selectedCategory = cat.id"
          class="px-4 py-2 mr-2 rounded-full text-sm font-medium transition"
          :class="selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ cat.nome }}
        </button>
      </div>

      <!-- Lista de Produtos -->
      <div class="flex-1 overflow-y-auto p-3 md:p-4">
        <div v-if="loadingProducts" class="text-center text-gray-500 py-10">
          Carregando produtos...
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-20">
          <div 
            v-for="product in filteredProducts" :key="product.id"
            @click="addToCart(product)"
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition active:scale-95 flex flex-row sm:flex-col min-h-[100px] sm:min-h-[140px] items-center sm:items-stretch gap-4 sm:gap-0"
          >
            <div class="flex-1">
              <h4 class="font-black text-gray-900 leading-tight mb-1 text-base">{{ product.nome }}</h4>
              <p class="text-xs text-gray-400 line-clamp-1 sm:line-clamp-2 mb-2 font-medium">{{ product.descricao }}</p>
            </div>
            <div class="mt-auto flex items-center justify-between sm:w-full">
              <span class="font-black text-orange-600 text-lg">
                {{ formatCurrency(product.preco) }}
              </span>
              <span class="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <span class="material-icons text-sm">add</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lado Direito: Comanda (Carrinho) -->
    <div class="w-full md:w-96 bg-white h-1/2 md:h-full flex flex-col shadow-xl z-10">
      <div class="p-4 bg-gray-900 text-white">
        <h2 class="text-lg font-bold">Comanda Atual</h2>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="cart.length === 0" class="text-center text-gray-400 py-10">
          Nenhum item adicionado
        </div>
        
        <div v-for="(item, index) in cart" :key="index" class="flex items-center justify-between border-b pb-2">
          <div v-if="item && item.product" class="flex-1 pr-2">
            <h4 class="font-semibold text-sm">{{ item.product.nome }}</h4>
            <div class="flex items-center mt-1">
              <button @click="updateQty(index, -1)" class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600">-</button>
              <span class="mx-3 text-sm font-medium">{{ item.quantity }}</span>
              <button @click="updateQty(index, 1)" class="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600">+</button>
            </div>
          </div>
          <div v-if="item && item.product" class="text-right flex flex-col justify-between h-full">
            <span class="font-bold text-gray-800">{{ formatCurrency(item.product.preco * item.quantity) }}</span>
            <button @click="removeFromCart(index)" class="text-xs text-red-500 hover:text-red-700 mt-2">Remover</button>
          </div>
        </div>
      </div>

      <div class="p-4 border-t bg-gray-50 sticky bottom-0">
        <div class="flex justify-between items-center mb-4">
          <span class="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Total:</span>
          <span class="text-2xl font-black text-gray-900">{{ formatCurrency(cartTotal) }}</span>
        </div>
        <div class="flex flex-col xs:flex-row gap-2">
          <button 
            @click="sendOrder"
            :disabled="cart.length === 0 || isSending"
            class="flex-1 py-4 px-2 rounded-2xl font-black text-white shadow-lg transition active:scale-95 text-sm uppercase tracking-tighter"
            :class="cart.length > 0 ? 'bg-linear-to-r from-green-500 to-emerald-600' : 'bg-gray-300 cursor-not-allowed'"
          >
            {{ isSending ? 'Enviando...' : 'Enviar Comanda' }}
          </button>
          
          <button 
            v-if="cart.length === 0"
            @click="openPaymentModal"
            class="flex-1 py-4 px-2 rounded-2xl font-black bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition active:scale-95 text-sm uppercase tracking-tighter"
          >
            Fechar Mesa
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Pagamento / Fechamento (Split) -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 my-auto">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-2xl font-black text-gray-900">Finalizar Conta</h3>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Mesa {{ mesaNumero }}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-bold text-gray-400 uppercase">Total da Conta</p>
            <p class="text-2xl font-black text-orange-600">{{ formatCurrency(orderTotal) }}</p>
          </div>
        </div>
        
        <!-- Lista de Pagamentos Adicionados -->
        <div class="space-y-3 mb-6">
          <div v-for="(pg, idx) in listaPagamentos" :key="idx" class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-right-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                <span class="material-icons text-xl">payments</span>
              </div>
              <div>
                <p class="text-sm font-black text-gray-900">{{ pg.forma }}</p>
                <p class="text-xs font-bold text-gray-400">{{ formatCurrency(pg.valor) }}</p>
              </div>
            </div>
            <button @click="removerPagamento(idx)" class="p-2 text-red-400 hover:bg-red-50 rounded-xl transition">
              <span class="material-icons text-lg">delete_outline</span>
            </button>
          </div>

          <div v-if="listaPagamentos.length === 0" class="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p class="text-gray-400 font-bold">Nenhum pagamento adicionado</p>
          </div>
        </div>

        <!-- Adicionar Novo Pagamento -->
        <div class="bg-primary-50/50 p-5 rounded-3xl border border-orange-100 mb-6">
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="col-span-2">
              <label class="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 ml-1">Valor</label>
              <div class="relative">
                 <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                 <input 
                  v-model="novoPagamento.valor" 
                  type="number" 
                  step="0.01"
                  class="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-white bg-white focus:border-orange-500 outline-none transition font-black text-gray-900 text-lg shadow-sm"
                  placeholder="0,00"
                >
              </div>
            </div>
            <div class="col-span-2">
              <label class="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 ml-1">Forma</label>
              <select v-model="novoPagamento.forma" class="w-full px-4 py-4 rounded-2xl border-2 border-white bg-white focus:border-orange-500 outline-none transition font-black text-gray-700 shadow-sm">
                <option v-for="m in ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix']" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
          <button 
            @click="adicionarPagamento"
            class="w-full py-4 bg-white text-orange-600 font-black rounded-2xl border-2 border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span class="material-icons">add_circle</span>
            Adicionar Pagamento
          </button>
        </div>

        <!-- Resumo Financeiro -->
        <div class="flex items-center justify-between p-5 bg-gray-900 rounded-3xl text-white mb-6 shadow-xl">
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Já Pago</p>
            <p class="text-xl font-black">{{ formatCurrency(totalJaPago) }}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ totalJaPago >= orderTotal ? 'Troco' : 'Restante' }}</p>
            <p class="text-xl font-black" :class="totalJaPago >= orderTotal ? 'text-emerald-400' : 'text-orange-400'">
              {{ formatCurrency(Math.abs(orderTotal - totalJaPago)) }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            @click="confirmarFinalizacao"
            :disabled="totalJaPago < (orderTotal - 0.01)"
            class="w-full py-5 rounded-2xl font-black text-white shadow-2xl transition active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3"
            :class="totalJaPago >= (orderTotal - 0.01) ? 'bg-orange-500 shadow-orange-200' : 'bg-gray-200 cursor-not-allowed opacity-50'"
          >
            <span class="material-icons">check_circle</span>
            Finalizar e Liberar Mesa
          </button>
          <button @click="showPaymentModal = false" class="py-3 text-gray-400 font-bold hover:text-gray-600 transition">Voltar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();

const categories = ref<any[]>([]);
const products = ref<any[]>([]);
const selectedCategory = ref<string | null>(null);
const loadingProducts = ref(true);
const isSending = ref(false);
const showPaymentModal = ref(false);
const activeOrderId = ref<string | null>(null);
const orderTotal = ref(0);
const mesaNumero = ref<number | null>(null);

const listaPagamentos = ref<{ forma: string; valor: number }[]>([]);
const novoPagamento = ref({ forma: 'Dinheiro', valor: 0 });

const totalJaPago = computed(() => {
  return listaPagamentos.value.reduce((acc, curr) => acc + Number(curr.valor), 0);
});

const cart = ref<{ product: any, quantity: number, notes?: string }[]>([]);

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter(p => p.categoria_id === selectedCategory.value);
});

const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => total + (item.product.preco * item.quantity), 0);
});

const fetchMenu = async () => {
  try {
    const [catRes, prodRes, activeOrderRes] = await Promise.all([
      api.get('/cardapio/categorias'),
      api.get('/cardapio/produtos'),
      api.get(`/pedidos/mesa/${route.params.id}`)
    ]);
    categories.value = catRes.data;
    products.value = prodRes.data;

    // Se houver um pedido aberto na mesa
    const aberto = activeOrderRes.data.find((p: any) => p.status !== 'fechado');
    if (aberto) {
      activeOrderId.value = aberto.id;
      // Calcular total a partir dos itens (mais confiável) ou do campo total
      if (aberto.itens && Array.isArray(aberto.itens)) {
        const totalItens = aberto.itens.reduce((sum: number, it: any) => sum + Number(it.subtotal || 0), 0);
        orderTotal.value = totalItens > 0 ? totalItens : (Number(aberto.total) || 0);
      } else {
        orderTotal.value = Number(aberto.total) || 0;
      }
    }

    // Buscar número da mesa
    const { data: mesaData } = await api.get(`/mesas/${route.params.id}`);
    mesaNumero.value = mesaData.numero;
  } catch (error) {
    console.error('Erro ao carregar cardápio', error);
  } finally {
    loadingProducts.value = false;
  }
};

const formatCurrency = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const addToCart = (product: any) => {
  const existingIndex = cart.value.findIndex(item => item.product.id === product.id);
  if (existingIndex >= 0 && cart.value[existingIndex]) {
    cart.value[existingIndex].quantity += 1;
  } else {
    cart.value.push({ product, quantity: 1 });
  }
};

const updateQty = (index: number, delta: number) => {
  const item = cart.value[index];
  if (item && item.quantity + delta > 0) {
    item.quantity += delta;
  }
};

const removeFromCart = (index: number) => {
  cart.value.splice(index, 1);
};

const sendOrder = async () => {
  if (cart.value.length === 0) return;
  isSending.value = true;
  try {
    let orderId = activeOrderId.value;

    // 1. Se não temos um ID de pedido ativo, tentamos criar um
    if (!orderId) {
      try {
        const orderRes = await api.post('/pedidos', { mesa_id: route.params.id });
        orderId = orderRes.data.id;
      } catch (e: any) {
        // Se der erro 400 (provavelmente mesa já ocupada, mas o front não sabia)
        if (e.response?.status === 400) {
          // Tenta buscar novamente o estado da mesa
          const activeOrderRes = await api.get(`/pedidos/mesa/${route.params.id}`);
          const aberto = activeOrderRes.data.find((p: any) => p.status !== 'fechado');
          if (aberto) {
            orderId = aberto.id;
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      }
    }

    // 2. Adicionar os itens
    const itemsPayload = cart.value.map(item => ({
      produto_id: item.product.id,
      quantidade: item.quantity,
      preco_unitario: item.product.preco,
      observacao: item.notes || null
    }));

    await api.post(`/pedidos/${orderId}/itens`, { itens: itemsPayload });
    
    // Limpar o carrinho e recarregar
    cart.value = [];
    alert('Comanda enviada com sucesso!');
    fetchMenu(); 
  } catch (error: any) {
    console.error('Erro ao enviar pedido', error);
    const msg = error.response?.data?.erro || error.message;
    alert('Erro ao enviar comanda: ' + msg);
  } finally {
    isSending.value = false;
  }
};

const openPaymentModal = () => {
  if (!activeOrderId.value) {
    alert('Não há pedido aberto para esta mesa.');
    return;
  }
  listaPagamentos.value = [];
  novoPagamento.value.valor = Number(orderTotal.value);
  showPaymentModal.value = true;
};

const adicionarPagamento = () => {
  const valorNum = Number(novoPagamento.value.valor);
  if (valorNum <= 0) return alert('Informe um valor válido');
  
  listaPagamentos.value.push({ 
    forma: novoPagamento.value.forma, 
    valor: valorNum
  });
  
  // Sugere o restante arredondado
  const restante = Number((orderTotal.value - totalJaPago.value).toFixed(2));
  novoPagamento.value.valor = restante > 0 ? restante : 0;
};

const removerPagamento = (idx: number) => {
  listaPagamentos.value.splice(idx, 1);
};

const confirmarFinalizacao = async () => {
  try {
    if (totalJaPago.value < (orderTotal.value - 0.01)) {
      return alert('O valor pago é menor que o total da conta.');
    }

    await api.post(`/pedidos/${activeOrderId.value}/finalizar`, { 
      pagamentos: listaPagamentos.value 
    });
    
    alert('Conta finalizada com sucesso! Mesa liberada.');
    router.push('/dashboard');
  } catch (error) {
    console.error('Erro ao finalizar conta', error);
    alert('Erro ao finalizar conta.');
  }
};

onMounted(() => {
  fetchMenu();
});
</script>
