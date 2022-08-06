<script setup lang="ts">
import { useNewsService } from '@/services/news-service';
import { useEventService } from '@/services/event-service';
import { useCustomValidators } from '@/composables/customValidators';
import { useDebounceWatcher } from '@/composables/debounceWatcher';
import type { EventType } from '@/dtos/event-type';
import type { Page } from '@/dtos/page';
import type { Pagination } from '@/dtos/pagination';
import type { Ref } from 'vue';
import type { EventDetail } from '@/dtos/event/event-detail';
import type { EventSearch } from '@/dtos/event/event-search';
import { useErrorHandler } from '@/composables/errorHandler';
import type { ImageMedia } from '@/dtos/image-media';

const toast = useToast();
const errorHandler = useErrorHandler(toast);
const { notBlank } = useCustomValidators();
const picture = helpers.withMessage('Image is required', required);

const page = ref<Page>({ pageIndex: 0, pageSize: 10 });
const events = ref<EventDetail[]>([]);
const total = ref<number>(0);

const rules = {
  title: { required, notBlank, maxLength: maxLength(255) },
  summary: { required, notBlank, maxLength: maxLength(255) },
  text: { required, notBlank, maxLength: maxLength(10000) },
  eventId: { required },
  image: { picture },
};

const newNews = ref<{ title: string; summary: string; text: string; eventId: number | null; image: ImageMedia | null }>({
  title: '',
  summary: '',
  text: '',
  eventId: null,
  image: null,
});

const newsService = useNewsService();
const eventService = useEventService();

const v$ = useVuelidate(rules, newNews);

const searchParams = ref<{ title: string; type: EventType | null; duration: number | null; description: string }>({
  title: '',
  type: null,
  duration: null,
  description: '',
});

async function search<T>(
  searchValue: T,
  searchFunction: (value: T, page: Page) => Promise<Pagination<T>>,
  ref: Ref<T[]>,
  total: Ref<number>
) {
  newNews.value.eventId = null;
  try {
    const data = await searchFunction(searchValue, page.value);
    ref.value = data.elements;
    total.value = data.total;
  } catch (err) {
    errorHandler.error(err);
  }
}

const eventSearch = () => search(searchParams.value as EventSearch, eventService.findByFilters, events, total);

const setEventId = (id: number) => {
  newNews.value.eventId = id;
};

async function addNews() {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    toast.error('News article not created - please check your inputs');
    return;
  }
  try {
    const news = await newsService.create({
      title: newNews.value.title,
      summary: newNews.value.summary,
      text: newNews.value.text,
      eventId: newNews.value.eventId ? newNews.value.eventId : 0,
      imageId: newNews.value.image?.id ?? 0,
    });
    console.log(news);
    toast.success('News created');
  } catch (error) {
    errorHandler.error(error);
  }
}
useDebounceWatcher(searchParams, eventSearch, 500);
eventSearch();
</script>

<template>
  <div class="flex rounded max-w-screen-lg mx-auto bg-slate-800 flex-col p-8 mt-8">
    <h1 class="font-bold text-2xl text-white mb-4">Create a News Article</h1>
    <label class="bg-slate-700 rounded px-3 py-1.5 mb-2 text-lg text-white">News Data</label>
    <form @submit.prevent="addNews">
      <div class="flex flex-col gap-1">
        <InputFloatingLabel label="Title" v-model="newNews.title" placeholder="Title" :errors="v$.title.$errors" />
        <InputFloatingLabel label="Summary" v-model="newNews.summary" placeholder="Summary" :errors="v$.summary.$errors" />
        <div>
          <label for="Text" class="text-gray-300">Text:</label>
          <div class="mt-2">
            <textarea
              id="Text"
              v-model="newNews.text"
              placeholder="The news"
              :errors="v$.text.$errors"
              rows="8"
              cols="100"
              class="form-control block w-full px-3 py-1.5 text-base text-white bg-slate-800 bg-clip-padding border border-solid border-gray-300 rounded m-0 focus:text-white focus:bg-slate-800 focus:border-blue-500 focus:outline-none" />
            <span class="text-rose-600 text-sm block" v-for="error of v$.text.$errors" :key="error.$uid">{{
              error.$message
            }}</span>
          </div>
        </div>
      </div>
      <div class="bg-slate-700 rounded mt-8 px-3 py-1.5 text-lg w-full text-white">
        <label>Select referred Event</label>
      </div>
      <span v-for="error in v$.eventId.$errors" :key="error.$uid" class="text-rose-600 text-sm block">{{
        error.$message
      }}</span>
      <div class="flex flex-row mt-3 mb-6 space-x-5">
        <div class="w-1/4">
          <InputFloatingLabel label="Title" v-model="searchParams.title" placeholder="Title" />
        </div>
        <div class="flex flex-col w-1/4 pl-5">
          <SelectEvent v-model="searchParams.type" :required="false"></SelectEvent>
        </div>
        <div class="w-1/2">
          <InputFloatingLabel label="Description" v-model="searchParams.description" placeholder="Description" />
        </div>
      </div>
      <ChooseableList
        :headers="['Title', 'Type', 'Description']"
        :object-array="events"
        :shownFields="['title', 'type', 'description']"
        :totalNumberOf="total"
        :pageSize="page.pageSize"
        :newEventShowProperty="newNews.eventId"
        @setId="setEventId">
      </ChooseableList>
      <ImageUploader label="Image" v-model:image="newNews.image"></ImageUploader>
      <span class="text-rose-600 text-sm block" v-for="error of v$.image.$errors" :key="error.$uid">{{ error.$message }}</span>
      <ButtonGreen type="submit" class="mt-5 w-full">Add News</ButtonGreen>
    </form>
  </div>
</template>
