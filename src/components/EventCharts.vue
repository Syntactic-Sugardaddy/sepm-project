<script setup lang="ts">
import { useErrorHandler } from '@/composables/errorHandler';
import type { EventType } from '@/dtos/event-type';
import type { EventDetail } from '@/dtos/event/event-detail';
import { useEventService } from '@/services/event-service';

const eventService = useEventService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const type = ref<EventType | null>(null);
const events = ref<EventDetail[]>([]);

async function topTen() {
  try {
    const data = await eventService.findTopTen({ type: type.value || undefined });
    events.value = data;
  } catch (error) {
    errorHandler.error(error);
  }
}

watch(type, topTen, { immediate: true });
</script>

<template>
  <div class="max-w-screen-lg mx-auto pt-8">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-semibold text-white">Top Sellers for {{ type || 'all Event Types' }} in the last 30 days</h1>
      <SelectEvent class="w-1/3" v-model="type" :required="false"></SelectEvent>
    </div>
    <div class="grid grid-rows-5 grid-cols-2 grid-flow-col gap-3">
      <div v-for="(event, index) in events" :key="index" class="bg-slate-800 rounded hover:bg-slate-600">
        <RouterLink :to="'/event/' + event.id + '/event-shows'" class="flex items-center gap-3 h-12">
          <div class="bg-blue-500 h-full flex items-center justify-center w-12 text-white text-lg font-semibold rounded-l">
            {{ index + 1 }}
          </div>
          <div class="text-white text-lg indent-2">{{ event.title }}</div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
