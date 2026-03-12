<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-gray-900">Cardápio</h1>
        <p class="text-gray-500">Gerencie os produtos, preços e categorias</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center gap-2"
      >
        <span class="material-icons">add</span>
        Novo Produto
      </button>
    </div>

    <!-- Filtro de Categoria -->
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button 
        @click="selectedCategory = null"
        class="px-5 py-2 rounded-full font-bold transition whitespace-nowrap"
        :class="selectedCategory === null ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100'"
      >
        Todos
      </button>
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        @click="selectedCategory = cat.id"
        class="px-5 py-2 rounded-full font-bold transition whitespace-nowrap"
        :class="selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100'"
      >
        {{ cat.nome }}
      </button>
    </div>

    <!-- Lista de Produtos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="prod in filteredProducts" 
        :key="prod.id"
        class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-orange-200 transition"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span class="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              {{ getCategoryName(prod.categoria_id) }}
            </span>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button @click="openModal(prod)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                <span class="material-icons text-sm">edit</span>
              </button>
              <button @click="remover(prod.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <span class="material-icons text-sm">delete</span>
              </button>
            </div>
          </div>
          <h4 class="text-xl font-black text-gray-900">{{ prod.nome }}</h4>
          <p class="text-gray-400 text-sm mt-1 line-clamp-2">{{ prod.descricao }}</p>
        </div>
        
        <div class="mt-6 flex items-center justify-between">
          <span class="text-2xl font-black text-orange-600">R$ {{ prod.preco }}</span>
          <span class="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{{ prod.setor }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <h3 class="text-2xl font-black text-gray-900 mb-6">{{ editandoId ? 'Editar Produto' : 'Novo Produto' }}</h3>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Nome</label>
              <input v-model="form.nome" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition" placeholder="Nome do item">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Preço (R$)</label>
              <input v-model.number="form.preco" type="number" step="0.01" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Setor Impressão</label>
              <select v-model="form.setor" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition bg-white">
                <option value="cozinha">Cozinha</option>
                <option value="copa">Bar / Copa</option>
                <option value="caixa">Caixa</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Categoria</label>
            <select v-model="form.categoria_id" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition bg-white">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nome }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Descrição</label>
            <textarea v-model="form.descricao" rows="2" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none transition" placeholder="Descrição curta"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600 transition">Cancelar</button>
          <button @click="salvar" class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition">
            Salvar Produto
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const selectedCategory = ref<string | null>(null);
const isModalOpen = ref(false);
const editandoId = ref<string | null>(null);

const form = ref({
  nome: '',
  descricao: '',
  preco: 0,
  categoria_id: '',
  setor: 'cozinha'
});

const loadData = async () => {
  const [pRes, cRes] = await Promise.all([
    api.get('/cardapio/produtos'),
    api.get('/cardapio/categorias')
  ]);
  products.value = pRes.data;
  categories.value = cRes.data;
  if (!form.value.categoria_id && categories.value.length > 0) {
    form.value.categoria_id = categories.value[0].id;
  }
};

const getCategoryName = (id: string) => {
  return categories.value.find(c => c.id === id)?.nome || 'Sem Categoria';
};

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter(p => p.categoria_id === selectedCategory.value);
});

const openModal = (prod?: any) => {
  if (prod) {
    editandoId.value = prod.id;
    form.value = { ...prod };
  } else {
    editandoId.value = null;
    form.value = { nome: '', descricao: '', preco: 0, categoria_id: categories.value[0]?.id || '', setor: 'cozinha' };
  }
  isModalOpen.value = true;
};

const salvar = async () => {
  if (!form.value.nome || !form.value.preco) return alert('Campos obrigatórios faltando');
  
  try {
    if (editandoId.value) {
      await api.put(`/cardapio/produtos/${editandoId.value}`, form.value);
    } else {
      await api.post('/cardapio/produtos', form.value);
    }
    isModalOpen.value = false;
    loadData();
  } catch (error) {
    alert('Erro ao salvar produto');
  }
};

const remover = async (id: string) => {
  if (!confirm('Excluir este produto?')) return;
  try {
    await api.delete(`/cardapio/produtos/${id}`);
    loadData();
  } catch (error) {
    alert('Erro ao excluir');
  }
};

onMounted(loadData);
</script>
