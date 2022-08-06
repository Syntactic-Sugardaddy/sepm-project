<script setup lang="ts">
defineProps<{
  modelValue: unknown[];
}>();

const emit = defineEmits<{
  (e: 'search'): void;
  (e: 'clear'): void;
}>();

emit('search');

function submitForm() {
  const focusedElement: any = document.activeElement;
  focusedElement?.blur?.();
  emit('search');
  focusedElement?.focus?.();
}
</script>
<template>
  <div class="rounded max-w-screen-lg mx-auto bg-slate-800 flex flex-col lg:px-12 p-4 mt-4 gap-2">
    <form @submit.prevent="submitForm">
      <slot name="filter-input"></slot>
      <div class="flex justify-end space-x-4 my-2 mt-5 mb-8">
        <ButtonGreen type="submit">Search</ButtonGreen>
        <ButtonBlue type="button" @click="$emit('clear')">Reset Filters</ButtonBlue>
      </div>
    </form>
    <div v-for="(item, index) in modelValue" :key="index">
      <slot name="result-item" :item="item"></slot>
    </div>
    <slot name="pagination"></slot>
  </div>
</template>
