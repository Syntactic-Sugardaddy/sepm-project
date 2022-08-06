<script setup lang="ts">
import { useNewsService } from '@/services/news-service';
import { ChevronLeftIcon } from '@heroicons/vue/outline';
import { ChevronRightIcon } from '@heroicons/vue/outline';
import type { Page } from '@/dtos/page';
import { useAuthStore } from '../stores/auth-store';
import { useErrorHandler } from '@/composables/errorHandler';
import type { NewsSearch } from '@/dtos/news/news-search';
import { useTextFormatter } from '@/composables/textFormatter';
import type { NewsDetail } from '@/dtos/news/news-detail';

const newsService = useNewsService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const news = ref<NewsDetail[]>([]);
const page = ref<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 3 });
const total = ref<number>(0);
const authStore = useAuthStore();
const { date } = useTextFormatter();
const maxPage = ref<number>(6);

async function getUnread() {
  try {
    let data;
    if (authStore.isLoggedIn) {
      data = await newsService.findUserNews(page.value as Page, { read: false } as NewsSearch);
    } else {
      data = await newsService.findAll(page.value as Page, {} as NewsSearch);
    }
    total.value = data.total;
    news.value = data.elements;
    maxPage.value = Math.min(6, Math.ceil(total.value / 3) - 1);
  } catch (error) {
    errorHandler.error(error);
  }
}

watch(
  page,
  () => {
    getUnread();
  },
  { deep: true }
);

getUnread();
</script>

<template>
  <div class="max-w-screen-lg mx-auto pt-8">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-xl font-semibold text-white">
        The most recent News Articles{{ authStore.isLoggedIn ? ' for you' : '' }}
      </h1>
    </div>
    <div class="relative">
      <div class="grid grid-cols-3 gap-4 text-white">
        <div v-for="(item, index) in news" :key="index" class="bg-slate-700 rounded">
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
      <ButtonBlue
        class="absolute top-1/2 left-0 rounded-full h-11 w-11 p-1 -translate-y-1/2 -translate-x-1/2 text-lg text-white"
        v-if="page.pageIndex !== 0"
        @click="page.pageIndex = Math.max(page.pageIndex - 1, 0)">
        <ChevronLeftIcon class="text-white h-7 w-7 -translate-x-2" aria-hidden="true"></ChevronLeftIcon>
      </ButtonBlue>
      <ButtonBlue
        class="absolute top-1/2 right-0 rounded-full h-11 w-11 p-0 -translate-y-1/2 translate-x-1/2 text-lg text-white"
        v-if="page.pageIndex !== Math.min(6, maxPage)"
        @click="page.pageIndex = Math.min(page.pageIndex + 1, maxPage)">
        <ChevronRightIcon class="text-white h-7 w-7 -translate-x-2" aria-hidden="true"></ChevronRightIcon>
      </ButtonBlue>
      <div class="flex gap-3 justify-center content-center h-5">
        <div v-for="index in maxPage + 1" :key="index">
          <button
            type="button"
            class="bg-white rounded-full h-2 w-2 p-1.5"
            :class="index === page.pageIndex + 1 ? 'bg-blue-600' : ''"
            @click="page.pageIndex = index - 1"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper .right {
  display: inline-block;
  word-break: break-word;
}
</style>
