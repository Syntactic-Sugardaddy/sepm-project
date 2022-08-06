<script setup lang="ts">
import type { MerchandiseSortOption } from '@/dtos/merchandise-sort-option';

defineProps<{ modelValue: string | null }>();

defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | null): void;
}>();

const baseOptions = ref<{ display: string; value: MerchandiseSortOption | null }[]>([
  { display: 'Name', value: 'NAME' },
  { display: 'Price Asc.', value: 'PRICE_ASCENDING' },
  { display: 'Price Desc.', value: 'PRICE_DESCENDING' },
  { display: 'Points Asc.', value: 'POINTS_ASCENDING' },
  { display: 'Points Desc.', value: 'POINTS_DESCENDING' },
]);
</script>

<template>
  <SelectBase
    label="Sort by"
    @update:modelValue="$emit('update:modelValue', $event)"
    :modelValue="modelValue"
    :options="baseOptions"></SelectBase>
</template>
