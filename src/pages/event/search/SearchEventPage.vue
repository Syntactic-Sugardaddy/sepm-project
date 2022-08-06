<script setup lang="ts">
import { useEventService } from '@/services/event-service';
import type { EventSearch } from '@/dtos/event/event-search';
import type { Page } from '@/dtos/page';
import type { EventType } from '@/dtos/event-type';
import { useRouterRef } from '@/composables/routerRef';
import { useCustomValidators } from '@/composables/customValidators';
import type { EventDetail } from '@/dtos/event/event-detail';
import { useErrorHandler } from '@/composables/errorHandler';

const toast = useToast();
const errorHandler = useErrorHandler(toast);
const { validEventType } = useCustomValidators();

const rules = {
  title: { maxLength: maxLength(255) },
  type: { validEventType },
  description: { maxLength: maxLength(255) },
  duration: {},
};
type Minutes = number;
const searchParams = useRouterRef<{ title: string; type: EventType | null; duration: Minutes | null; description: string }>({
  title: '',
  type: null,
  duration: null,
  description: '',
});

const eventService = useEventService();
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);
const events = ref<EventDetail[]>([]);
const total = ref<number | null>(null);

const v$ = useVuelidate(rules, searchParams);

const clearFilters = () => {
  searchParams.value = { title: '', type: null, duration: null, description: '' };
};

async function eventSearch() {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    return;
  }
  try {
    // Minutes to seconds
    const data = await eventService.findByFilters(
      {
        ...searchParams.value,
        duration: searchParams.value.duration ? searchParams.value.duration * 60 : null,
      } as EventSearch,
      page.value as Page
    );
    total.value = data.total;
    events.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
}
</script>

<template>
  <SearchBase @search="eventSearch" @clear="clearFilters" :model-value="events">
    <template v-slot:filter-input>
      <div class="flex gap-8">
        <InputFloatingLabel v-model="searchParams.title" placeholder="Title" label="Title" />
        <InputFloatingLabel v-model="searchParams.description" placeholder="Description" label="Description">
        </InputFloatingLabel>
      </div>
      <div class="flex gap-8">
        <SelectEvent class="w-1/3" v-model="searchParams.type" :required="false"></SelectEvent>
        <InputTimeDuration
          :labels="['Duration (days)', '(hours)', '(minutes +/- 30)']"
          :placeholders="['Duration (days)', '(hours)', '(minutes +/- 30)']"
          v-model="searchParams.duration" />
      </div>
    </template>
    <template #result-item="{ item }">
      <RouterLink :to="'/event/' + (item as EventDetail).id + '/event-shows'">
        <CardEvent :item="(item as EventDetail)"></CardEvent>
      </RouterLink>
    </template>
    <template v-slot:pagination>
      <PaginationBar
        :total="total ?? 0"
        v-model:page-size="page.pageSize"
        v-model:page-index="page.pageIndex"
        @switch-page="eventSearch"
        v-if="events.length > 0">
      </PaginationBar>
    </template>
  </SearchBase>

  <h1 class="mt-2 text-white text-2xl font-semibold py-2 max-w-screen-lg mx-auto" v-if="total === 0">
    We're sorry - there is currently no event which matches your requirements
  </h1>
</template>
