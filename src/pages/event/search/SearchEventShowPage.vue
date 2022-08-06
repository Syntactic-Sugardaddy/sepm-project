<script setup lang="ts">
import { useEventShowService } from '@/services/event-show-service';
import type { Page } from '@/dtos/page';
import type { EventShowDetail } from '@/dtos/eventshow/event-show-detail';
import type { IsoDateTimeString } from '@/dtos/iso-date-time-string';
import type { EventShowSearch } from '@/dtos/eventshow/event-show-search';
import { useRouterRef } from '@/composables/routerRef';
//import { useCustomValidators } from '@/composables/customValidators';
import { useErrorHandler } from '@/composables/errorHandler';

const toast = useToast();
const errorHandler = useErrorHandler(toast);
const eventShowService = useEventShowService();
const searchParams = useRouterRef<{
  name: string;
  startDate: IsoDateTimeString;
  endDate: IsoDateTimeString;
  duration: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  eventName: string;
  locationName: string;
  country: string;
  city: string;
  artistName: string;
}>({
  name: '',
  startDate: '',
  endDate: '',
  duration: null,
  minPrice: null,
  maxPrice: null,
  eventName: '',
  locationName: '',
  city: '',
  country: '',
  artistName: '',
});
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);
const shows = ref<EventShowDetail[]>([]);
const total = ref<number | null>(null);

const rules = {
  name: { maxLength: maxLength(255) },
  startDate: {},
  endDate: {},
  duration: { minValue: minValue(0) },
  minPrice: { minValue: minValue(0) },
  maxPrice: { minValue: minValue(0) },
  eventName: { maxLength: maxLength(255) },
};

const v$ = useVuelidate(rules, searchParams);

const eventShowSearch = async () => {
  const validate = await v$.value.$validate();
  if (!validate) {
    return;
  }
  try {
    const data = await eventShowService.findByFilters(
      {
        ...searchParams.value,
        duration: searchParams.value.duration ? Math.trunc(searchParams.value.duration * 3600) : null,
      } as EventShowSearch,
      page.value as Page
    );
    total.value = data.total;
    shows.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
};

const clearFilters = () => {
  searchParams.value = {
    name: '',
    startDate: '',
    endDate: '',
    duration: null,
    minPrice: null,
    maxPrice: null,
    eventName: '',
    locationName: '',
    country: '',
    city: '',
    artistName: '',
  };
};
</script>

<template>
  <SearchBase @search="eventShowSearch" @clear="clearFilters" :model-value="shows">
    <template v-slot:filter-input>
      <!-- Name -->
      <div class="grid grid-cols-3 gap-x-8 gap-y-3">
        <InputFloatingLabel
          class="col-span-2"
          label="Name of Show"
          v-model="searchParams.name"
          placeholder="Name of Show"
          :errors="v$.name.$errors" />
        <InputFloatingLabel
          label="Name of Event"
          v-model="searchParams.eventName"
          placeholder="Name of Event"
          :errors="v$.eventName.$errors" />

        <!-- Date, Time and Duration -->
        <InputFloatingLabel
          label="Start Date (begins after)"
          v-model="searchParams.startDate"
          type="datetime-local"
          placeholder="dd/mm/yyyy"
          :errors="v$.startDate.$errors" />
        <InputFloatingLabel
          label="End Date (ends before)"
          v-model="searchParams.endDate"
          type="datetime-local"
          placeholder="dd/mm/yyyy"
          :errors="v$.endDate.$errors" />
        <InputFloatingLabel label="Duration (hours)" v-model="searchParams.duration" type="number" min="0" placeholder="" />

        <!-- Price, Title & Artist -->
        <InputCurrency label="Price (min)" v-model="searchParams.minPrice" :errors="v$.minPrice.$errors" placeholder="0" />
        <InputCurrency label="Price (max)" v-model="searchParams.maxPrice" :errors="v$.maxPrice.$errors" placeholder="0" />
        <InputFloatingLabel
          label="Artist"
          v-model="searchParams.artistName"
          placeholder="John Doe"
          :errors="v$.eventName.$errors" />

        <!-- Location -->
        <InputFloatingLabel
          label="Venue"
          v-model="searchParams.locationName"
          placeholder="Venue"
          :errors="v$.eventName.$errors" />
        <InputFloatingLabel label="City" v-model="searchParams.city" placeholder="City" :errors="v$.eventName.$errors" />
        <InputFloatingLabel
          label="Country"
          v-model="searchParams.country"
          placeholder="Country"
          :errors="v$.eventName.$errors" />
      </div>
    </template>
    <template #result-item="{ item }">
      <CardEventShow :item="(item as EventShowDetail)"></CardEventShow>
    </template>
    <template v-slot:pagination v-if="shows.length > 0">
      <PaginationBar
        :total="total ?? 0"
        v-model:page-size="page.pageSize"
        v-model:page-index="page.pageIndex"
        @switch-page="eventShowSearch">
      </PaginationBar>
    </template>
  </SearchBase>
  <h1 class="mt-2 text-white text-2xl font-semibold py-2 max-w-screen-lg mx-auto" v-if="total === 0">
    We're sorry - there is currently no show which matches your requirements
  </h1>
</template>
