import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../modules/autenticacao/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../modules/pdv/TablesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/table/:id',
    name: 'OrderBuilder',
    component: () => import('../modules/pdv/OrderBuilderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/delivery',
    name: 'DeliveryDashboard',
    component: () => import('../modules/delivery/DeliveryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/delivery/novo',
    name: 'DeliveryBuilder',
    component: () => import('../modules/delivery/DeliveryBuilderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: () => import('../modules/painel/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../modules/painel/AdminDashboard.vue')
      },
      {
        path: 'cardapio',
        name: 'AdminCardapio',
        component: () => import('../modules/painel/ProdutosView.vue')
      },
      {
        path: 'clientes',
        name: 'AdminClientes',
        component: () => import('../modules/painel/ClientesView.vue')
      },
      {
        path: 'fornecedores',
        name: 'AdminFornecedores',
        component: () => import('../modules/painel/FornecedoresView.vue')
      },
      {
        path: 'usuarios',
        name: 'AdminUsuarios',
        component: () => import('../modules/painel/UsuariosView.vue')
      },
      {
        path: 'relatorios',
        name: 'AdminRelatorios',
        component: () => import('../modules/painel/RelatoriosView.vue')
      },
      {
        path: 'configuracoes',
        name: 'AdminConfiguracoes',
        component: () => import('../modules/painel/SettingsView.vue')
      }
    ]
  },
  {
    path: '/',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  // Safe init
  authStore.loadUser();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return '/dashboard';
  }
  return true;
});

export default router;
