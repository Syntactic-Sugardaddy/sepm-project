<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/outline';

const props = defineProps<{
  total: number;
  pageSize: number;
  pageIndex: number;
}>();

const emits = defineEmits<{
  (e: 'update:pageIndex', currentIndex: number): void;
  (e: 'update:total', total: number): void;
  (e: 'switchPage', currentPage: number): void;
}>();

const currentPage = ref(props.pageIndex);
const numberOfPages = computed(() => Math.ceil(props.total / props.pageSize));
watch(
  currentPage,
  (newPage) => {
    emits('update:pageIndex', newPage);
  },
  { immediate: true }
);

watch(currentPage, (newPage) => {
  emits('switchPage', newPage);
});

watch(numberOfPages, () => {
  if (currentPage.value >= numberOfPages.value) {
    currentPage.value = Math.max(0, numberOfPages.value - 1);
  }
});

class RangeInclusive {
  readonly start: number;
  readonly end: number;
  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  plus(offset: number) {
    return new RangeInclusive(this.start + offset, this.end + offset);
  }

  get length() {
    return Math.max(0, this.end - this.start + 1);
  }

  toArray() {
    return Array.from(Array(this.length), (_, i) => this.start + i);
  }
}
const pages = computed(() => {
  const neighbours = 3;
  // Our pagination bar can use at most this many pages. Everything else is an "overflow".
  const totalSlots = neighbours * 2 + 1;

  // internally, pages start with 0
  const firstPage = 0;
  const lastPage = numberOfPages.value - 1;

  // easy case, we can just show all pages
  if (numberOfPages.value < totalSlots) {
    return {
      pages: new RangeInclusive(firstPage, lastPage).toArray(),
    };
  }

  let pageRange = new RangeInclusive(0, totalSlots - 1);
  // center it around the current page
  pageRange = pageRange.plus(currentPage.value - neighbours);

  // handle start and end bounds
  if (pageRange.start < firstPage) {
    // positive offset, move the range back into bounds
    pageRange = pageRange.plus(firstPage - pageRange.start);
  }
  if (pageRange.end > lastPage) {
    // negative offset, move the range back into bounds
    pageRange = pageRange.plus(lastPage - pageRange.end);
  }

  // now since the pageRange.length is less than the number of pages,
  // we can be sure that it is in bounds

  // potentially add ... to the start/end
  const pages: (number | null)[] = pageRange.toArray();
  if (pageRange.start > firstPage) {
    pages[0] = 0;
    pages[1] = null;
  }
  if (pageRange.end < lastPage) {
    pages[pages.length - 1] = lastPage;
    pages[pages.length - 2] = null;
  }

  return {
    pages,
  };
});
</script>

<template>
  <div v-if="total > pageSize" class="flex justify-center mt-6">
    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px flex-1 justify-center" aria-label="Pagination">
      <button
        class="relative inline-flex items-center p-1 rounded-l-md border border-gray-300 bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
        @click="currentPage = Math.max(0, currentPage - 1)">
        <span class="sr-only">Previous</span>
        <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
      </button>

      <!-- Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" -->
      <div
        aria-current="page"
        v-for="(page, index) in pages.pages"
        :key="index"
        class="border-white text-white relative inline-flex justify-center items-center px-2 py-2 border text-sm font-medium"
        :class="page === currentPage ? 'bg-blue-500 text-white' : ''"
        @click="if (page !== null) currentPage = page;">
        <button v-if="page !== null">{{ page + 1 }}</button>
        <span v-else class="text-center select-none">...</span>
      </div>

      <button
        class="relative inline-flex items-center px-1 py-2 rounded-r-md border border-gray-300 bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
        @click="currentPage = Math.min(Math.max(0, numberOfPages - 1), currentPage + 1)">
        <span class="sr-only">Next</span>
        <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  </div>
</template>
