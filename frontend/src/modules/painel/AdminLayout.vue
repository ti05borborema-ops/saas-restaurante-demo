<template>
  <div class="flex min-h-dvh bg-gray-50 flex-col md:flex-row w-full overflow-x-hidden relative">
    <!-- Sidebar / Navigation -->
    <aside 
      class="bg-gray-900 text-white w-full md:w-64 shrink-0 transition-all duration-300 z-20"
      :class="{ 'h-16 md:h-auto overflow-hidden': !isMenuOpen }"
    >
      <div class="p-6 flex items-center justify-between w-full overflow-hidden">
        <h2 class="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-red-400 truncate pr-4">
          AdminPro
        </h2>
        <button @click="isMenuOpen = !isMenuOpen" class="md:hidden text-white shrink-0 p-2 bg-gray-800 rounded-lg">
          <span class="material-icons text-xl">{{ isMenuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>

      <nav class="mt-4 px-4 space-y-2">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium"
          :class="route.path === item.path ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
          @click="isMenuOpen = false"
        >
          <span class="material-icons text-xl">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>

        <div class="pt-10">
          <button 
            @click="logout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
          >
            <span class="material-icons">logout</span>
            Sair
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 md:p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Dashboard / Subview -->
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const menuItems = [
  { label: 'Visão Geral', path: '/admin', icon: 'dashboard' },
  { label: 'Cardápio', path: '/admin/cardapio', icon: 'restaurant_menu' },
  { label: 'Relatórios', path: '/admin/relatorios', icon: 'analytics' },
  { label: 'Usuários', path: '/admin/usuarios', icon: 'badge' },
  { label: 'Clientes', path: '/admin/clientes', icon: 'people' },
  { label: 'Fornecedores', path: '/admin/fornecedores', icon: 'local_shipping' },
  { label: 'Configurações', path: '/admin/configuracoes', icon: 'settings' },
  { label: 'Voltar às Mesas', path: '/dashboard', icon: 'point_of_sale' },
  { label: 'PDV Delivery', path: '/delivery', icon: 'delivery_dining' },
];

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>


