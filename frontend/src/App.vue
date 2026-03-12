<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

onMounted(() => {
  const authStore = useAuthStore();
  authStore.loadUser();
});
</script>
