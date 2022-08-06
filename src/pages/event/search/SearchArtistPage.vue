<script setup lang="ts">
import type { ArtistSearch } from '@/dtos/artist/artist-search';
import { useArtistService } from '@/services/artist-service';
import type { Page } from '@/dtos/page';
import type { ArtistDetail } from '@/dtos/artist/artist-detail';
import { useRouterRef } from '@/composables/routerRef';
import { useErrorHandler } from '@/composables/errorHandler';

const searchParams = useRouterRef<{ firstName: string; lastName: string; stageName: string }>({
  firstName: '',
  lastName: '',
  stageName: '',
});

const artistService = useArtistService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);

const artists = ref<ArtistDetail[]>([]);
const total = ref<number | null>(null);

const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);

const reloadSearch = async () => {
  try {
    const data = await artistService.findByFilters(searchParams.value as ArtistSearch, page.value as Page);
    total.value = data.total;
    artists.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
};

const clearFilters = () => {
  searchParams.value = { firstName: '', lastName: '', stageName: '' };
};
</script>

<template>
  <SearchBase v-model="artists" @search="reloadSearch" @clear="clearFilters">
    <template v-slot:filter-input>
      <div class="flex space-x-8">
        <InputFloatingLabel v-model="searchParams.firstName" placeholder="First Name" label="First Name"> </InputFloatingLabel>
        <InputFloatingLabel v-model="searchParams.lastName" placeholder="Last Name" label="Last Name"> </InputFloatingLabel>
      </div>
      <div class="flex">
        <InputFloatingLabel v-model="searchParams.stageName" placeholder="Stage Name" label="Stage Name"> </InputFloatingLabel>
      </div>
    </template>
    <template #result-item="{ item }">
      <!-- https://github.com/vuejs/rfcs/discussions/436 -->
      <RouterLink :to="'/artist/' + (item as ArtistDetail).id + '/events'">
        <CardArtist :item="(item as ArtistDetail)"></CardArtist>
      </RouterLink>
    </template>
    <template v-slot:pagination>
      <PaginationBar
        :total="total ?? 0"
        v-model:page-size="page.pageSize"
        v-model:page-index="page.pageIndex"
        @switch-page="reloadSearch"
        v-if="artists.length > 0">
      </PaginationBar>
    </template>
  </SearchBase>
  <h1 class="mt-2 text-white text-2xl font-semibold py-2 max-w-screen-lg mx-auto" v-if="total === 0">
    We're sorry - there is currently no artist which matches your requirements
  </h1>
</template>
