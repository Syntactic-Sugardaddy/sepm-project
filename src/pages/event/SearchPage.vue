<script setup lang="ts">
const pages = ref([
  { name: 'Event', to: '/search/event' },
  { name: 'Location', to: '/search/location' },
  { name: 'Show', to: '/search/event-show' },
  { name: 'Artist', to: '/search/artist' },
]);
</script>

<template>
  <div class="max-w-screen-lg mx-auto">
    <div class="flex justify-center bg-slate-700 p-1 rounded-md text-white font-bold mt-8">
      <RouterLink
        v-for="(page, index) in pages"
        :key="index"
        :to="page.to"
        active-class="bg-blue-500"
        class="py-2 rounded-md flex-1 text-center">
        {{ page.name }}
      </RouterLink>
    </div>
  </div>

  <RouterView />
</template>
