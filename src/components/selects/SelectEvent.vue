<script setup lang="ts">
import type { EventType } from '@/dtos/event-type';

const props = defineProps<{ required: boolean; modelValue: string | number | null }>();

defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | null): void;
}>();

const baseOptions = ref<{ display: string; value: EventType | null; disabled?: boolean }[]>([
  { value: 'MOVIE', display: 'Movie' },
  { value: 'THEATRE', display: 'Theatre' },
  { value: 'OPERA', display: 'Opera' },
  { value: 'CONCERT', display: 'Concert' },
  { value: 'COMEDY', display: 'Comedy' },
  { value: 'SPORTS', display: 'Sports' },
]);

const options = computed(() => {
  const optionCopy = [...baseOptions.value];
  if (!props.required) {
    optionCopy.unshift({ value: null, display: 'All types', disabled: false });
  } else {
    optionCopy.unshift({ value: null, display: 'Select type', disabled: true });
  }
  return optionCopy;
});
</script>

<template>
  <SelectBase
    label="Event Type"
    @update:modelValue="$emit('update:modelValue', $event)"
    :modelValue="modelValue"
    :options="options"></SelectBase>
</template>
