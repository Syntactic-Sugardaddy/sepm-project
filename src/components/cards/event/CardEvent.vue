<script setup lang="ts">
import type { EventDetail } from '@/dtos/event/event-detail';
import { useTextFormatter } from '@/composables/textFormatter';

defineProps<{ item: EventDetail }>();

const { date, duration } = useTextFormatter();
</script>

<template>
  <CardBase>
    <div class="flex justify-between">
      <div>
        <p class="text-lg font-semibold text-emerald-400">{{ item.title }}</p>
        <p class="capitalize font-semibold pb-4">{{ item.type.toLowerCase() }}</p>
      </div>
      <div v-if="item.startTime && item.endTime" class="text-right">
        <p class="font-semibold">{{ `${date(item.startTime)} - ${date(item.endTime)}` }}</p>
        <p>{{ `${duration(item.startTime, item.endTime)}` }}</p>
      </div>
    </div>
    <p>{{ item.description }}</p>
  </CardBase>
</template>
