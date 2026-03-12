<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Gestão de Usuários</h1>
        <p class="text-sm text-gray-500">Controle o acesso de funcionários e administradores</p>
      </div>
      <button 
        @click="openModal()" 
        class="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
      >
        <span class="material-icons text-sm">person_add</span>
        Novo Usuário
      </button>
    </div>

    <!-- Card: Minha Senha -->
    <div class="bg-gray-900 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <span class="material-icons text-white">lock</span>
        </div>
        <div>
          <p class="text-white font-black text-lg leading-tight">Minha Senha</p>
          <p class="text-gray-400 text-sm">Altere a senha da sua conta de acesso</p>
        </div>
      </div>
      <button 
        @click="openSenhaModal(currentUserId, 'Minha Conta')"
        class="w-full sm:w-auto bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 shrink-0"
      >
        <span class="material-icons text-sm">key</span>
        Trocar Minha Senha
      </button>
    </div>

    <!-- Lista de Usuários -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left min-w-[600px]">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nome</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50/50 transition">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    {{ user.nome.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-bold text-gray-900">{{ user.nome }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-600 font-medium">{{ user.email || '-' }}</td>
              <td class="px-6 py-4">
                <span 
                  class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="user.tipo === 'master' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'bg-blue-100 text-blue-600 border border-blue-200'"
                >
                  {{ user.tipo === 'master' ? 'Administrador' : 'Funcionário' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="flex items-center gap-1.5 font-bold text-xs"
                  :class="user.ativo ? 'text-emerald-500' : 'text-red-400'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.ativo ? 'bg-emerald-500' : 'bg-red-400'"></span>
                  {{ user.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-1">
                  <!-- Trocar senha -->
                  <button 
                    @click="openSenhaModal(user.id, user.nome)" 
                    class="p-2 text-orange-400 hover:bg-orange-50 rounded-lg transition" 
                    title="Trocar senha"
                  >
                    <span class="material-icons text-sm">key</span>
                  </button>
                  <!-- Editar -->
                  <button @click="openModal(user)" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Editar">
                    <span class="material-icons text-sm">edit</span>
                  </button>
                  <!-- Excluir -->
                  <button 
                    @click="remover(user.id)" 
                    class="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                    title="Excluir"
                  >
                    <span class="material-icons text-sm">delete_outline</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="px-6 py-16 text-center text-gray-400 font-bold">
                Nenhum usuário cadastrado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Criar/Editar Usuário -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-black text-gray-900">{{ editandoId ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Nome completo</label>
            <input v-model="form.nome" type="text" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" placeholder="Ex: João da Silva">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Email (opcional)</label>
            <input v-model="form.email" type="email" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" placeholder="email@exemplo.com">
          </div>
          <div v-if="!editandoId">
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Senha</label>
            <input v-model="form.senha" type="password" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" placeholder="Mínimo 6 caracteres">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Nível de Acesso</label>
              <select v-model="form.tipo" class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 transition">
                <option value="funcionario">Funcionário</option>
                <option value="master">Administrador</option>
              </select>
            </div>
            <div>
               <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Status</label>
               <select v-model="form.ativo" class="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-orange-500 transition">
                <option :value="true">Ativo</option>
                <option :value="false">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="isModalOpen = false" class="flex-1 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition">Cancelar</button>
          <button @click="salvar" class="flex-1 py-3 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition">
            {{ editandoId ? 'Atualizar' : 'Criar Usuário' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Trocar Senha -->
    <div v-if="isSenhaModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-2xl font-black text-gray-900">Trocar Senha</h3>
          <button @click="isSenhaModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        <p class="text-sm text-gray-500 mb-6">
          Alterando senha de: <span class="font-bold text-gray-800">{{ senhaModalNome }}</span>
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Nova Senha</label>
            <div class="relative">
              <input 
                v-model="senhaForm.nova" 
                :type="mostrarNova ? 'text' : 'password'" 
                class="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" 
                placeholder="Mínimo 6 caracteres"
              >
              <button @click="mostrarNova = !mostrarNova" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <span class="material-icons text-sm">{{ mostrarNova ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1 pl-1">Confirmar Nova Senha</label>
            <div class="relative">
              <input 
                v-model="senhaForm.confirmar" 
                :type="mostrarConfirmar ? 'text' : 'password'" 
                class="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                :class="senhaForm.confirmar && senhaForm.nova !== senhaForm.confirmar ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''"
                placeholder="Repita a nova senha"
              >
              <button @click="mostrarConfirmar = !mostrarConfirmar" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <span class="material-icons text-sm">{{ mostrarConfirmar ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <p v-if="senhaForm.confirmar && senhaForm.nova !== senhaForm.confirmar" class="text-red-500 text-xs font-bold mt-1 pl-1">
              As senhas não coincidem
            </p>
          </div>

          <!-- Indicador de força da senha -->
          <div v-if="senhaForm.nova" class="space-y-1">
            <div class="flex gap-1">
              <div v-for="n in 4" :key="n" class="h-1 flex-1 rounded-full transition-all duration-300" :class="forcaSenha >= n ? corForca : 'bg-gray-100'"></div>
            </div>
            <p class="text-xs font-bold" :class="corForcaTexto">{{ labelForca }}</p>
          </div>
        </div>

        <!-- Feedback -->
        <div v-if="senhaFeedback" class="mt-4 px-4 py-3 rounded-xl text-sm font-bold" :class="senhaFeedback.tipo === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'">
          {{ senhaFeedback.msg }}
        </div>

        <div class="flex gap-3 mt-8">
          <button @click="isSenhaModalOpen = false" class="flex-1 py-3 border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition">Cancelar</button>
          <button 
            @click="salvarSenha" 
            :disabled="!senhaForm.nova || senhaForm.nova !== senhaForm.confirmar || senhaForm.nova.length < 6"
            class="flex-1 py-3 bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar Troca
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';

// ─── Dados ──────────────────────────────────────────────────
const users = ref<any[]>([]);
const isModalOpen = ref(false);
const editandoId = ref<string | null>(null);

// ID do usuário logado atualmente
const currentUserId = computed(() => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const parts = token.split('.');
    const b64Payload = parts[1];
    if (!b64Payload) return null;
    const payload = JSON.parse(atob(b64Payload));
    return payload.id;
  } catch { return null; }
});

const form = ref({
  nome: '',
  email: '',
  senha: '',
  tipo: 'funcionario',
  ativo: true
});

// ─── Modal de Troca de Senha ─────────────────────────────────
const isSenhaModalOpen = ref(false);
const senhaParaId = ref<string | null>(null);
const senhaModalNome = ref('');
const mostrarNova = ref(false);
const mostrarConfirmar = ref(false);
const senhaFeedback = ref<{ tipo: string; msg: string } | null>(null);

const senhaForm = ref({ nova: '', confirmar: '' });

const forcaSenha = computed(() => {
  const s = senhaForm.value.nova;
  let f = 0;
  if (s.length >= 6) f++;
  if (s.length >= 10) f++;
  if (/[A-Z]/.test(s) || /[0-9]/.test(s)) f++;
  if (/[^A-Za-z0-9]/.test(s)) f++;
  return f;
});

const corForca = computed(() => {
  if (forcaSenha.value <= 1) return 'bg-red-400';
  if (forcaSenha.value === 2) return 'bg-orange-400';
  if (forcaSenha.value === 3) return 'bg-yellow-400';
  return 'bg-emerald-500';
});

const corForcaTexto = computed(() => {
  if (forcaSenha.value <= 1) return 'text-red-400';
  if (forcaSenha.value === 2) return 'text-orange-400';
  if (forcaSenha.value === 3) return 'text-yellow-600';
  return 'text-emerald-600';
});

const labelForca = computed(() => {
  if (forcaSenha.value <= 1) return 'Senha fraca';
  if (forcaSenha.value === 2) return 'Senha razoável';
  if (forcaSenha.value === 3) return 'Senha boa';
  return 'Senha forte';
});

// ─── Funções ─────────────────────────────────────────────────
const loadUsers = async () => {
  try {
    const { data } = await api.get('/usuarios');
    users.value = data;
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
};

const openModal = (user?: any) => {
  if (user) {
    editandoId.value = user.id;
    form.value = { ...user, senha: '' };
  } else {
    editandoId.value = null;
    form.value = { nome: '', email: '', senha: '', tipo: 'funcionario', ativo: true };
  }
  isModalOpen.value = true;
};

const openSenhaModal = (userId: string | null, nome: string) => {
  if (!userId) return alert('Usuário não identificado. Faça login novamente.');
  senhaParaId.value = userId;
  senhaModalNome.value = nome;
  senhaForm.value = { nova: '', confirmar: '' };
  senhaFeedback.value = null;
  mostrarNova.value = false;
  mostrarConfirmar.value = false;
  isSenhaModalOpen.value = true;
};

const salvar = async () => {
  if (!form.value.nome) return alert('Nome é obrigatório');
  if (!editandoId.value && !form.value.senha) return alert('Senha é obrigatória para novos usuários');

  try {
    const payload: any = { ...form.value };
    if (editandoId.value) {
      delete payload.senha; // Senha só muda via modal dedicado
      await api.put(`/usuarios/${editandoId.value}`, payload);
    } else {
      await api.post('/usuarios', payload);
    }
    isModalOpen.value = false;
    loadUsers();
  } catch (error) {
    alert('Erro ao salvar usuário');
  }
};

const salvarSenha = async () => {
  if (!senhaParaId.value) return;
  if (senhaForm.value.nova.length < 6) return;
  if (senhaForm.value.nova !== senhaForm.value.confirmar) return;

  senhaFeedback.value = null;

  try {
    await api.put(`/usuarios/${senhaParaId.value}`, { senha: senhaForm.value.nova });
    senhaFeedback.value = { tipo: 'success', msg: '✓ Senha alterada com sucesso!' };
    setTimeout(() => { isSenhaModalOpen.value = false; }, 1500);
  } catch (error) {
    senhaFeedback.value = { tipo: 'error', msg: 'Erro ao alterar a senha. Tente novamente.' };
  }
};

const remover = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
  try {
    await api.delete(`/usuarios/${id}`);
    loadUsers();
  } catch (error) {
    alert('Erro ao remover usuário');
  }
};

onMounted(loadUsers);
</script>
