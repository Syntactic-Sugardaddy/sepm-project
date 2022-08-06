<script setup lang="ts">
import { useErrorHandler } from '@/composables/errorHandler';
import { useRouterRef } from '@/composables/routerRef';
import type { EventShowDetail } from '@/dtos/eventshow/event-show-detail';
import type { LocationDetail } from '@/dtos/location/location-detail';
import { useEventShowService } from '@/services/event-show-service';
import { useLocationService } from '@/services/location-service';

const eventShowService = useEventShowService();
const locationService = useLocationService();

const eventShows = ref<EventShowDetail[]>([]);
const location = ref<LocationDetail>();
const total = ref<number>(0);

const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);

const route = useRoute();
const router = useRouter();
const toast = useToast();
const errorHandler = useErrorHandler(toast);

const locationId = parseInt(route.params.id as string, 10);
if (!locationId) {
  router.push('/');
}

const reloadEventShows = async () => {
  try {
    const data = await eventShowService.findByLocationId(locationId, page.value);
    const loadedLocation = await locationService.findById(locationId);
    location.value = loadedLocation;
    total.value = data.total;
    eventShows.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
};

reloadEventShows();
</script>

<template>
  <div class="max-w-screen-lg mx-auto mt-8" v-if="total > 0">
    <div class="bg-slate-800 rounded mb-4 py-2.5 px-4 text-white text-2xl">
      <span class="font-normal">Shows at the Location </span>
      <span class="font-semibold">{{ location?.name }}</span>
    </div>
    <div class="flex flex-col gap-2">
      <div v-for="eventshow in eventShows" :key="eventshow.id">
        <div class="bg-slate-700 text-white rounded hover:bg-slate-600">
          <CardEventShow :item="eventshow"></CardEventShow>
        </div>
      </div>
    </div>
  </div>
  <h1 class="mt-2 text-white text-2xl font-semibold py-2 max-w-screen-lg mx-auto" v-if="total === 0">
    We're sorry - there are no listed shows for this location at the moment.
  </h1>
</template>
