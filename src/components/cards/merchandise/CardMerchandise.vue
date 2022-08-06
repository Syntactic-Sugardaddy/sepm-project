<script setup lang="ts">
import { useTextFormatter } from '@/composables/textFormatter';
import type { MerchandisePurchaseDetail } from '@/dtos/merchandise/merchandise-purchase-detail';
import { TrashIcon } from '@heroicons/vue/outline';

const props = defineProps<{
  item: MerchandisePurchaseDetail;
}>();

const emit = defineEmits<{
  (e: 'remove'): void;
  (e: 'updateQuantity', value: number): void;
}>();

const { euro } = useTextFormatter();

const qty = computed(() => props.item.quantity);
</script>

<template>
  <div class="relative">
    <div class="flex rounded text-white">
      <div class="flex flex-col basis-1/4 p-3">
        <p class="text-2xl m-auto text-blue-500">{{ item.merchandiseProduct.name }}</p>
        <p class="m-auto text-slate-300">
          Quantity:
          <select
            @click.stop
            class="w-10 bg-slate-700 border-b-2 rounded border-gray-300 text-white focus:outline-none focus:border-blue-500"
            :value="qty"
            @change="(e) => {
              emit('updateQuantity', +(e.target as HTMLSelectElement).value); 
              (e.target as HTMLSelectElement).value = ''+qty
            }">
            <option v-for="index in item.merchandiseProduct.itemsPerCustomer" :key="index" :value="index">
              {{ index }}
            </option>
          </select>
        </p>
        <p class="m-auto text-slate-300">{{ item.merchandiseProduct.stock }} in stock</p>
      </div>
      <div class="rounded basis-1/2 p-3"></div>
      <div class="flex p-3 basis-1/4 text-right">
        <p class="text-xl self-end grow">
          {{ item.usePoints ? `${item.points * item.quantity} Points` : euro(item.price * item.quantity) }}
        </p>
      </div>
    </div>
    <ButtonRed class="px-1 py-1 flex absolute top-3 right-3 text-slate-900" @click.stop="$emit('remove')">
      <TrashIcon class="text-slate-900 h-6 w-6" aria-hidden="true"></TrashIcon>
    </ButtonRed>
  </div>
</template>
