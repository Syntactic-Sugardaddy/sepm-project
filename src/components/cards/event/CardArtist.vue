<script setup lang="ts">
import type { ArtistDetail } from '@/dtos/artist/artist-detail';

defineProps<{ item: ArtistDetail }>();
</script>

<template>
  <CardBase>
    <p v-if="item.stageName" class="text-lg font-semibold">{{ item.stageName }}</p>
    <p v-if="item.lastName || item.firstName" :class="!item.stageName ? 'text-lg font-semibold' : ''">
      {{ [item.lastName, item.firstName].filter((x) => x).join(', ') }}
    </p>
  </CardBase>
</template>
