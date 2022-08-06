<script setup lang="ts">
import { useErrorHandler } from '@/composables/errorHandler';
import { useRouterRef } from '@/composables/routerRef';
import type { Page } from '@/dtos/page';
import { useNewsService } from '@/services/news-service';
import type { IsoDateTimeString } from '@/dtos/iso-date-time-string';
import type { EventType } from '@/dtos/event-type';
import type { NewsSearch } from '@/dtos/news/news-search';
import { useAuthStore } from '@/stores/auth-store';
import { useTextFormatter } from '@/composables/textFormatter';
import { useDebounceWatcher } from '@/composables/debounceWatcher';
import type { NewsDetail } from '@/dtos/news/news-detail';

const searchParams = useRouterRef<{
  content: string | null;
  from: IsoDateTimeString | null;
  to: IsoDateTimeString | null;
  eventTitle: string | null;
  eventType: EventType | null;
  read: boolean | null;
}>({
  content: '',
  from: null,
  to: null,
  eventTitle: '',
  eventType: null,
  read: null,
});

const newsService = useNewsService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const authStore = useAuthStore();
const { date } = useTextFormatter();

const allNews = ref<NewsDetail[]>([]);
const total = ref<number>(0);
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 15 }, ['pageSize']);

const reloadNews = async () => {
  try {
    let data;
    if (authStore.isLoggedIn) {
      data = await newsService.findUserNews(page.value as Page, searchParams.value as NewsSearch);
    } else {
      data = await newsService.findAll(page.value as Page, searchParams.value as NewsSearch);
    }
    total.value = data.total;
    allNews.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
};

reloadNews();
useDebounceWatcher(searchParams, reloadNews, 500);
</script>

<template>
  <h1 class="flex mx-auto max-w-screen-lg font-semibold text-2xl text-white mt-8 flex-col">All published news articles</h1>
  <div class="flex gap-2 bg-slate-800 mt-4 p-6 rounded flex-col max-w-screen-lg mx-auto">
    <label class="text-white font-bold">Filter Options</label>
    <div class="flex space-x-8">
      <InputFloatingLabel v-model="searchParams.content" label="News Content" placeholder="News Content" />
      <InputFloatingLabel v-model="searchParams.eventTitle" label="Event Title" placeholder="Event Title" />
    </div>
    <div class="flex gap-8">
      <SelectEvent class="w-1/3" v-model="searchParams.eventType" :required="false"></SelectEvent>
      <InputFloatingLabel v-model="searchParams.from" label="Published after" placeholder="" type="datetime-local" />
      <InputFloatingLabel v-model="searchParams.to" label="Published before" placeholder="" type="datetime-local" />
      <SelectRead class="w-1/3" :required="false" v-model="searchParams.read" v-if="authStore.isLoggedIn"> </SelectRead>
    </div>
  </div>
  <div class="mt-6 max-w-screen-lg mx-auto">
    <div class="grid grid-cols-3 gap-5 text-white">
      <div v-for="(item, index) in allNews" :key="index" class="bg-slate-700 rounded">
        <RouterLink :to="'/news/' + item.id">
          <div class="aspect-video">
            <SystemImage :name="item.imageName" class="object-cover w-full h-full rounded"></SystemImage>
          </div>
          <div class="p-4 flex justify-between h-44 overflow-clip">
            <div class="flex flex-col w-full">
              <div class="flex justify-between">
                <span class="font-semibold">{{ item.title }}</span>
                <span class="text-right">{{ date(item.published) }}</span>
              </div>
              <div class="wrapper mt-2">
                <p class="text-sm right">{{ item.summary }}</p>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
    <h1 class="mt-2 text-white text-2xl font-semibold py-2" v-if="total === 0">
      We're sorry - there is currently no news article which matches your requirements
    </h1>
  </div>

  <PaginationBar
    :total="total"
    v-model:page-size="page.pageSize"
    v-model:page-index="page.pageIndex"
    @switch-page="reloadNews()">
  </PaginationBar>
</template>

<style scoped>
.wrapper .right {
  display: inline-block;
  word-break: break-word;
}
</style>
