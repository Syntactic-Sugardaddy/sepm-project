<script setup lang="ts">
const props = defineProps<{ required: boolean; modelValue: boolean | null }>();

defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | null): void;
}>();

const baseOptions = ref<{ display: string; value: boolean | null; disabled?: boolean }[]>([
  { value: true, display: 'read' },
  { value: false, display: 'unread' },
]);

const options = computed(() => {
  const optionCopy = [...baseOptions.value];
  if (!props.required) {
    optionCopy.unshift({ value: null, display: 'All news', disabled: false });
  } else {
    optionCopy.unshift({ value: null, display: 'Select', disabled: true });
  }
  return optionCopy;
});
</script>

<template>
  <SelectBase
    label="read/unread/all"
    @update:modelValue="$emit('update:modelValue', $event)"
    :modelValue="modelValue"
    :options="options"></SelectBase>
</template>
