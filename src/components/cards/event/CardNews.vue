<script setup lang="ts">
import { useTextFormatter } from '@/composables/textFormatter';
import type { NewsDetail } from '@/dtos/news/news-detail';

defineProps<{ item: NewsDetail }>();

const { date } = useTextFormatter();
</script>

<template>
  <RouterLink :to="'/news/' + item.id">
    <CardBase>
      <p class="text-lg font-semibold">{{ item.title }}</p>
      <p>{{ date(item.published) }}</p>
      <p>Event: {{ item.event.title }}</p>
      <p>Type: {{ item.event.type }}</p>
      <p>{{ item.summary }}</p>
    </CardBase>
  </RouterLink>
</template>
