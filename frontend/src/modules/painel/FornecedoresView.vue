<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Fornecedores</h1>
        <p class="text-sm text-gray-500">Gerencie seus parceiros e fornecedores</p>
      </div>
      <button 
        @click="openModal()" 
        class="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
      >
        <span class="material-icons text-sm">add</span>
        Novo Fornecedor
      </button>
    </div>

    <!-- Lista de Fornecedores -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full text-left min-w-[700px] md:min-w-0">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nome / Empresa</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Telefone</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contato</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="forn in fornecedores" :key="forn.id" class="hover:bg-gray-50/50 transition">
              <td class="px-6 py-4 font-bold text-gray-900 min-w-[150px]">{{ forn.nome }}</td>
              <td class="px-6 py-4 text-gray-600 min-w-[120px]">{{ forn.telefone || '-' }}</td>
              <td class="px-6 py-4 text-gray-500 min-w-[150px]">{{ forn.contato || '-' }}</td>
              <td class="px-6 py-4 text-right sticky right-0 bg-white shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.02)]">
                <div class="flex justify-end gap-2">
                  <button @click="openModal(forn)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                    <span class="material-icons">edit</span>
                  </button>
                  <button @click="remover(forn.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="fornecedores.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-400">Nenhum fornecedor cadastrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <h3 class="text-2xl font-black text-gray-900 mb-6">{{ editandoId ? 'Editar Fornecedor' : 'Novo Fornecedor' }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Nome / Empresa</label>
            <input v-model="form.nome" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" placeholder="Nome da empresa ou fornecedor">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Telefone</label>
            <input v-model="form.telefone" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" placeholder="(00) 00000-0000">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Pessoa de Contato</label>
            <input v-model="form.contato" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" placeholder="Ex: João da logística">
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="isModalOpen = false" class="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600 transition">Cancelar</button>
          <button @click="salvar" class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition">
            Salvar Fornecedor
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const fornecedores = ref<any[]>([]);
const isModalOpen = ref(false);
const editandoId = ref<string | null>(null);

const form = ref({
  nome: '',
  telefone: '',
  contato: ''
});

const loadFornecedores = async () => {
  const { data } = await api.get('/fornecedores');
  fornecedores.value = data;
};

const openModal = (fornecedor?: any) => {
  if (fornecedor) {
    editandoId.value = fornecedor.id;
    form.value = { ...fornecedor };
  } else {
    editandoId.value = null;
    form.value = { nome: '', telefone: '', contato: '' };
  }
  isModalOpen.value = true;
};

const salvar = async () => {
  if (!form.value.nome) return alert('Nome é obrigatório');
  
  try {
    if (editandoId.value) {
      await api.put(`/fornecedores/${editandoId.value}`, form.value);
    } else {
      await api.post('/fornecedores', form.value);
    }
    isModalOpen.value = false;
    loadFornecedores();
  } catch (error) {
    alert('Erro ao salvar fornecedor');
  }
};

const remover = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir?')) return;
  try {
    await api.delete(`/fornecedores/${id}`);
    loadFornecedores();
  } catch (error) {
    alert('Erro ao remover fornecedor');
  }
};

onMounted(loadFornecedores);
</script>
