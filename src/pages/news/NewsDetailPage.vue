<script setup lang="ts">
import { useNewsService } from '@/services/news-service';
import { useTextFormatter } from '@/composables/textFormatter';
import { useAuthStore } from '@/stores/auth-store';
import { useErrorHandler } from '@/composables/errorHandler';
import type { NewsDetail } from '@/dtos/news/news-detail';

const authStore = useAuthStore();
const newsService = useNewsService();
const route = useRoute();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const { date } = useTextFormatter();

const newsId = ref<number>(+route.params.id);
const news = ref<NewsDetail | null>(null);

const loadNews = async () => {
  try {
    news.value = await newsService.findOne(newsId.value);
    if (authStore.isLoggedIn) {
      await newsService.markNewsAsRead(newsId.value);
    }
  } catch (error) {
    errorHandler.error(error);
  }
};

loadNews();
</script>

<template>
  <div class="mx-auto max-w-screen-lg" v-if="news">
    <h1 class="font-bold text-2xl text-white mb-2 mt-2 flex-col">{{ news?.title }}</h1>
    <div class="aspect-video">
      <SystemImage :name="news.imageName" class="object-cover w-full h-full rounded"></SystemImage>
    </div>
    <div class="text-white flex justify-between my-4 items-center">
      <p>Published: {{ date(news.published) }}</p>
      <RouterLink :to="'/event/' + news.event.id + '/event-shows'">
        <ButtonBlue>View Shows of {{ news.event.title }}</ButtonBlue>
      </RouterLink>
    </div>
    <article class="flex text-white bg-slate-800 p-8 rounded flex-col whitespace-pre-line text-justify wrapper">
      <p class="font-bold mb-8 right">
        {{ news.summary }}
      </p>
      <p class="right">
        {{ news.text }}
      </p>
    </article>
  </div>
</template>

<style scoped>
.wrapper .right {
  display: inline-block;
  word-break: break-word;
}
</style>
