<script setup lang="ts">
import { useLocationService } from '@/services/location-service';
import type { LocationDetail } from '@/dtos/location/location-detail';
import { useRouterRef } from '@/composables/routerRef';
import { useErrorHandler } from '@/composables/errorHandler';

const toast = useToast();
const errorHandler = useErrorHandler(toast);

const searchParams = useRouterRef<{ name: string; country: string; city: string; postalCode: string; address: string }>({
  name: '',
  country: '',
  city: '',
  postalCode: '',
  address: '',
});
const locationService = useLocationService();
const locations = ref<LocationDetail[]>([]);

const total = ref<number | null>(null);

const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);

const locationSearch = async () => {
  try {
    const data = await locationService.findByFilters(searchParams.value, page.value);
    total.value = data.total;
    locations.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
};

const clearFilters = () => {
  searchParams.value = { name: '', country: '', city: '', postalCode: '', address: '' };
};
</script>

<template>
  <SearchBase @search="locationSearch" @clear="clearFilters" :model-value="locations">
    <template v-slot:filter-input>
      <div class="flex space-x-8">
        <InputFloatingLabel v-model="searchParams.name" placeholder="Name" label="Name"></InputFloatingLabel>
        <InputFloatingLabel v-model="searchParams.country" placeholder="Country" label="Country"></InputFloatingLabel>
      </div>
      <div class="flex space-x-8">
        <InputFloatingLabel v-model="searchParams.city" placeholder="City" label="City"></InputFloatingLabel>
        <InputFloatingLabel v-model="searchParams.postalCode" placeholder="Postal Code" label="Postal Code">
        </InputFloatingLabel>
      </div>
      <div class="flex">
        <InputFloatingLabel v-model="searchParams.address" placeholder="Address" label="Address"></InputFloatingLabel>
      </div>
    </template>
    <template #result-item="{ item }">
      <RouterLink :to="'/location/' + (item as LocationDetail).id + '/event-shows'">
        <CardLocation :item="(item as LocationDetail)"></CardLocation>
      </RouterLink>
    </template>
    <template v-slot:pagination>
      <PaginationBar
        :total="total ?? 0"
        v-model:page-size="page.pageSize"
        v-model:page-index="page.pageIndex"
        @switch-page="locationSearch">
        @switch-page="locationSearch" v-if="locations.length > 0">
      </PaginationBar>
    </template>
  </SearchBase>
  <h1 class="mt-2 text-white text-2xl font-semibold py-2 max-w-screen-lg mx-auto" v-if="total === 0">
    We're sorry - there is currently no location which matches your requirements
  </h1>
</template>
