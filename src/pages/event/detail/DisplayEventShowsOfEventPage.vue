<script setup lang="ts">
import { useEventShowService } from '@/services/event-show-service';
import { useEventService } from '@/services/event-service';
import type { Page } from '@/dtos/page';
import type { EventShowDetail } from '@/dtos/eventshow/event-show-detail';
import { useRouterRef } from '@/composables/routerRef';
import { useErrorHandler } from '@/composables/errorHandler';

const shows = ref<EventShowDetail[]>([]);
const route = useRoute();
const router = useRouter();
const toast = useToast();
const errorHandler = useErrorHandler(toast);

const eventId = parseInt(route.params.id as string, 10);
if (!eventId) {
  router.push('/');
}

const eventShowService = useEventShowService();
const eventService = useEventService();
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 });
const total = ref<number>(0);
const eventTitle = ref<string | null>(null);

async function onLoad() {
  try {
    const data = await eventShowService.findByEventId(eventId, page.value as Page);
    const event = await eventService.findById(eventId);
    eventTitle.value = event.title;
    total.value = data.total;
    shows.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
}

onLoad();
</script>

<template>
  <div class="max-w-screen-lg mx-auto mt-8" v-if="total > 0">
    <div class="bg-slate-800 rounded py-2.5 px-4 text-white text-2xl">
      <span class="font-normal">Shows at the Event </span>
      <span class="font-semibold">{{ eventTitle }}</span>
    </div>
    <div class="flex flex-col mt-4 gap-2">
      <div v-for="show in shows" :key="show.id">
        <div class="bg-slate-700 text-white rounded hover:bg-slate-600">
          <CardEventShow :item="show"></CardEventShow>
        </div>
      </div>
    </div>
    <PaginationBar :total="total" v-model:page-size="page.pageSize" v-model:page-index="page.pageIndex" @switch-page="onLoad()">
    </PaginationBar>
  </div>
  <h1 class="mt-2 text-white text-2xl font-semibold py-2 max-w-screen-lg mx-auto" v-if="total === 0">
    We're sorry - there are no listed shows for the event {{ eventTitle }} at the moment.
  </h1>
</template>
