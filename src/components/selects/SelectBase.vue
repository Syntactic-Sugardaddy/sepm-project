<script setup lang="ts">
type Option = {
  value: string | number | boolean | null;
  display: string;
  disabled?: boolean;
};

const props = defineProps<{ label: string; modelValue: string | number | boolean | null; options: Option[] }>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | null): void;
}>();

const localSelection = ref(props.modelValue);

watch(localSelection, (newSelection) => {
  emits('update:modelValue', newSelection);
});
</script>

<template>
  <div class="relative mt-4" v-bind="$attrs">
    <select
      class="peer h-10 w-full bg-slate-800 border-b-2 border-gray-300 text-white focus:outline-none focus:border-blue-500"
      v-model="localSelection">
      <option v-for="(option, index) in options" :key="index" :disabled="option.disabled || false" :value="option.value">
        {{ option.display }}
      </option>
    </select>
    <label
      class="pointer-events-none absolute left-0 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-300 peer-focus:text-sm">
      {{ label }}
    </label>
  </div>
</template>
