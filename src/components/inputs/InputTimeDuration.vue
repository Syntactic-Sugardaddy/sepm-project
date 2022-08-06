<script setup lang="ts">
const props = defineProps<{
  labels: [string, string, string];
  placeholders?: [string, string, string];
  modelValue: number | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

const daysInput = ref<string | number | boolean | null | undefined>(0);
const hoursInput = ref<string | number | boolean | null | undefined>(0);
const minutesInput = ref<string | number | boolean | null | undefined>(0);

const totalMinutes = computed(() => {
  let total = 0;
  if (minutesInput.value) {
    total += +minutesInput.value;
  }
  if (hoursInput.value) {
    total += +hoursInput.value * 60;
  }
  if (daysInput.value) {
    total += +daysInput.value * 24 * 60;
  }
  return total;
});

const setDaysHoursMinutes = (minutes: number) => {
  const toHours = Math.floor(minutes / 60);
  const toDays = Math.floor(toHours / 24);
  const remainingHours = toHours % 24;
  const remainingMinutes = minutes % 60;

  daysInput.value = toDays;
  hoursInput.value = remainingHours;
  minutesInput.value = remainingMinutes;

  emit('update:modelValue', totalMinutes.value ? totalMinutes.value : null);
};

watch(
  () => props.modelValue,
  (minutes) => {
    setDaysHoursMinutes(minutes || 0);
  },
  { immediate: true }
);
</script>
<template>
  <span class="flex gap-4">
    <InputFloatingLabel
      class="w-full"
      :label="labels[0]"
      :placeholder="placeholders?.[0]"
      :modelValue="daysInput ? daysInput : ''"
      @update:modelValue="(value) => (daysInput = value || 0)"
      @focusout="setDaysHoursMinutes(totalMinutes)"
      type="number"
      min="0"></InputFloatingLabel>
    <InputFloatingLabel
      class="w-full"
      :label="labels[1]"
      :placeholder="placeholders?.[1]"
      :modelValue="hoursInput ? hoursInput : ''"
      @update:modelValue="(value) => (hoursInput = value || 0)"
      @focusout="setDaysHoursMinutes(totalMinutes)"
      type="number"
      min="0"></InputFloatingLabel>
    <InputFloatingLabel
      class="w-full"
      :label="labels[2]"
      :placeholder="placeholders?.[2]"
      :modelValue="minutesInput ? minutesInput : ''"
      @update:modelValue="(value) => (minutesInput = value || 0)"
      @focusout="setDaysHoursMinutes(totalMinutes)"
      type="number"
      min="0"></InputFloatingLabel>
  </span>
</template>
