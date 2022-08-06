<script setup lang="ts">
import type { ErrorObject } from '@vuelidate/core';

defineProps<{
  label: string;
  placeholder?: string;
  modelValue: string | number | boolean | null | undefined;
  errors?: ErrorObject[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | null | undefined): void;
}>();

const updateValue = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
};
</script>

<template>
  <div class="w-full relative mt-4">
    <input
      class="peer h-10 w-full bg-inherit border-b-2 border-gray-300 text-white placeholder-transparent focus:outline-none focus:border-blue-500"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      v-bind="$attrs" />
    <label
      class="pointer-events-none absolute left-0 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-300 peer-focus:text-sm">
      {{ label }}
    </label>
    <span class="text-rose-500 text-sm block" v-for="error of errors" :key="error.$uid"> {{ error.$message }}</span>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
