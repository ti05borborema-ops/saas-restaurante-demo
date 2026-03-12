<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col relative group">
    <!-- Header: ID + Time -->
    <div class="flex justify-between items-start mb-3">
      <div>
        <span class="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
          #{{ displayId }}
        </span>
      </div>
      <div class="text-right">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ timeElapsed }}</p>
      </div>
    </div>

    <!-- Client Info -->
    <div class="mb-3">
      <h4 class="font-black text-gray-900 text-sm leading-tight">{{ delivery.cliente_nome }}</h4>
      <p class="text-xs text-gray-500 truncate">{{ delivery.endereco }}</p>
    </div>

    <!-- Items Preview (Compact) -->
    <div class="bg-gray-50 rounded-xl p-2 mb-3">
      <ul class="space-y-1">
        <li v-for="(it, idx) in previewItems" :key="Object(it).id || idx" class="text-[10px] font-bold text-gray-600 flex justify-between">
          <span class="truncate pr-2"><span class="text-gray-400">{{ Object(it).quantidade }}x</span> {{ Object(it).produto_nome }}</span>
        </li>
      </ul>
      <p v-if="delivery.itens?.length > 3" class="text-[10px] font-bold text-gray-400 text-center mt-1 pt-1 border-t border-gray-200">+ {{ delivery.itens.length - 3 }} itens</p>
    </div>

    <!-- Total -->
    <div class="flex justify-between items-center mb-3">
      <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
      <span class="font-black text-gray-900">{{ formatCurrency(delivery.total) }}</span>
    </div>

    <!-- Actions (only if not read-only) -->
    <div v-if="!readOnly" class="mt-auto pt-2 grid gap-2" :class="onCancel ? 'grid-cols-[1fr_2fr]' : 'grid-cols-1'">
      <button 
        v-if="onCancel"
        @click="$emit('cancel')" 
        class="py-2.5 rounded-xl font-bold transition-all text-xs border-2 border-transparent bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
      >
        Cancelar
      </button>
      
      <button 
        @click="$emit('action')" 
        class="py-2.5 rounded-xl font-black text-white shadow-md transition-all text-xs uppercase tracking-widest"
        :class="actionColor"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

const props = defineProps<{
  delivery: any;
  actionLabel?: string;
  actionColor?: string;
  readOnly?: boolean;
}>();

const emit = defineEmits(['action', 'cancel']);
const attrs = useAttrs();

// Check if there is a listener for cancel
const onCancel = computed(() => {
  return !!attrs.onCancel;
});

const displayId = computed(() => {
  const id = props.delivery.pedido_id;
  return id ? id.substring(0, 5).toUpperCase() : 'NOVO';
});

const previewItems = computed(() => {
  if (!props.delivery.itens || !Array.isArray(props.delivery.itens)) return [];
  // Some drivers return [null] when aggregating empty arrays
  const valid = props.delivery.itens.filter((i: any) => i && i.produto_nome);
  return valid.slice(0, 3);
});

const formatCurrency = (val: number | string) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
};

const timeElapsed = computed(() => {
  const d = new Date(props.delivery.data_delivery);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
});
</script>
