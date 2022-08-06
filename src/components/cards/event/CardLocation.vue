<script setup lang="ts">
import type { LocationDetail } from '@/dtos/location/location-detail';

defineProps<{
  item: LocationDetail;
}>();
</script>

<template>
  <CardBase>
    <p class="text-lg font-semibold">{{ item.name }}</p>
    <p>{{ item.address }}</p>
    <p>{{ item.city }}, {{ item.postalCode }}, {{ item.country }}</p>
  </CardBase>
</template>
