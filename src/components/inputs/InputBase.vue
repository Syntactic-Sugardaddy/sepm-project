<script setup lang="ts">
import type { ErrorObject } from '@vuelidate/core';

defineProps<{
  label: string;
  placeholder: string;
  modelValue: string | number | null | undefined;
  errors?: ErrorObject[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void;
}>();

const updateValue = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
};
</script>

<template>
  <label class="text-sm font-semibold">{{ label }}</label>
  <input
    class="rounded py-2 px-3 text-slate-900"
    :value="modelValue"
    @input="updateValue"
    :placeholder="placeholder"
    v-bind="$attrs" />
  <span class="text-rose-500 text-sm block" v-for="error of errors" :key="error.$uid">
    {{ error.$message }}
  </span>
</template>
