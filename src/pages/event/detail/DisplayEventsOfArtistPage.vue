<script setup lang="ts">
import { useErrorHandler } from '@/composables/errorHandler';
import { useRouterRef } from '@/composables/routerRef';
import type { ArtistDetail } from '@/dtos/artist/artist-detail';
import type { EventDetail } from '@/dtos/event/event-detail';
import { useArtistService } from '@/services/artist-service';
import { useEventService } from '@/services/event-service';

const eventService = useEventService();
const artistService = useArtistService();

const events = ref<EventDetail[]>([]);
const artist = ref<ArtistDetail | null>();
const total = ref<number>(0);
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);

const route = useRoute();
const router = useRouter();
const toast = useToast();
const errorHandler = useErrorHandler(toast);

const artistId = parseInt(route.params.id as string, 10);
if (!artistId) {
  router.push('/');
}

const reloadEvents = async () => {
  try {
    const data = await eventService.findByArtistId(artistId, page.value);
    const loadedArtist = await artistService.findById(artistId);
    artist.value = loadedArtist;
    total.value = data.total;
    events.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
};

reloadEvents();
</script>

<template>
  <div class="max-w-screen-lg mx-auto mt-8" v-if="total > 0">
    <div class="bg-slate-800 rounded mb-4 py-2.5 px-4 text-white text-2xl">
      <span class="font-normal">Events of Artist </span>
      <span v-if="artist?.stageName" class="font-semibold">{{ artist?.stageName }}</span>
      <span v-else>{{ artist?.firstName }} {{ artist?.lastName }}</span>
    </div>
    <div class="flex flex-col gap-2">
      <div v-for="event in events" :key="event.id">
        <div class="bg-slate-700 text-white rounded hover:bg-slate-600">
          <RouterLink :to="'/event/' + event.id + '/event-shows'">
            <CardEvent :item="event"></CardEvent>
          </RouterLink>
        </div>
      </div>
    </div>
    <PaginationBar
      :total="total"
      v-model:page-size="page.pageSize"
      v-model:page-index="page.pageIndex"
      @switch-page="reloadEvents">
    </PaginationBar>
  </div>
  <h1 class="mt-2 text-white text-2xl font-semibold py-2 max-w-screen-lg mx-auto" v-if="total === 0">
    We're sorry - there are no listed events starring this artist at the moment.
  </h1>
</template>
