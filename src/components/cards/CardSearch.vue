<script setup lang="ts">
defineProps<{
  main: string;
  additional?: unknown[];
}>();
</script>

<template>
  <div class="bg-slate-700 m-1 p-2 text-white rounded hover:bg-slate-600 mx-4">
    <p class="font-bold">{{ main }}</p>
    <p v-for="(add, index) in additional" :key="index">{{ add }}</p>
  </div>
</template>
