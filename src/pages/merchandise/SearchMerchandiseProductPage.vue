<script setup lang="ts">
import { useDebounceWatcher } from '@/composables/debounceWatcher';
import { useErrorHandler } from '@/composables/errorHandler';
import { useRouterRef } from '@/composables/routerRef';
import { useTextFormatter } from '@/composables/textFormatter';
import type { MerchandiseSortOption } from '@/dtos/merchandise-sort-option';
import type { MerchandiseProductDetail } from '@/dtos/merchandise/merchandise-product-detail';
import type { MerchandiseProductSearch } from '@/dtos/merchandise/merchandise-product-search';
import { useMerchandiseProductService } from '@/services/merchandise-product-service';

const toast = useToast();
const errorHandler = useErrorHandler(toast);

const searchParams = useRouterRef<{
  name: string;
  priceLowerBound: number | null;
  priceUpperBound: number | null;
  pointsLowerBound: number | null;
  pointsUpperBound: number | null;
  sortOption: MerchandiseSortOption;
}>({
  name: '',
  priceLowerBound: null,
  priceUpperBound: null,
  pointsLowerBound: null,
  pointsUpperBound: null,
  sortOption: 'NAME',
});

const merchandiseProductService = useMerchandiseProductService();

const merchandises = ref<MerchandiseProductDetail[]>([]);

const total = ref<number | null>(null);
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 12 }, ['pageSize']);

const reloadSearch = async () => {
  try {
    const data = await merchandiseProductService.findByFilters(searchParams.value as MerchandiseProductSearch, page.value);
    total.value = data.total;
    merchandises.value = data.elements;
  } catch (error) {
    errorHandler.error(error);
  }
};
reloadSearch();

useDebounceWatcher(searchParams, reloadSearch, 500);

const { euro } = useTextFormatter();
</script>
<template>
  <div class="max-w-screen-lg mx-auto">
    <div class="flex bg-slate-800 mt-8 p-5 rounded flex-col">
      <h1 class="text-white font-bold text-lg">Filter Merchandise Products</h1>
      <div class="flex gap-6">
        <InputFloatingLabel label="Name" placeholder="Name" v-model="searchParams.name"></InputFloatingLabel>
        <div class="flex gap-2">
          <InputCurrency class="w-22" placeholder="" label="min. price (€)" v-model="searchParams.priceLowerBound">
          </InputCurrency>
          <InputCurrency class="w-22" placeholder="" label="max. price (€)" v-model="searchParams.priceUpperBound">
          </InputCurrency>
        </div>
        <div class="flex gap-2">
          <InputFloatingLabel class="w-22" placeholder="" label="min. points" v-model="searchParams.pointsLowerBound">
          </InputFloatingLabel>
          <InputFloatingLabel class="w-22" placeholder="" label="max. points" v-model="searchParams.pointsUpperBound" />
        </div>
      </div>
    </div>

    <div class="mt-3" v-if="total != null && total > 0">
      <div class="flex rounded bg-slate-800 px-4 py-3 justify-between mb-4">
        <h1 class="text-white text-2xl font-semibold my-auto py-2">Merchandise Products</h1>
        <SelectMerchandiseItemSort v-model="searchParams.sortOption"></SelectMerchandiseItemSort>
      </div>
      <div class="grid grid-cols-4 gap-4 text-white">
        <div v-for="(merchandise, index) in merchandises" :key="index" class="bg-slate-700 rounded-b">
          <RouterLink :to="'/merchandise/' + merchandise.id">
            <div class="aspect-square">
              <SystemImage :name="merchandise.imageName" class="object-cover w-full h-full rounded-t"></SystemImage>
            </div>
            <div class="p-2 flex justify-between">
              <div class="flex flex-col">
                <span class="font-semibold">{{ merchandise.name }}</span>
                <span class="text-sm">{{ merchandise.stock }} left</span>
              </div>
              <div class="flex flex-col">
                <span class="text-right">{{ euro(merchandise.price) }}</span>
                <span class="text-right">{{ merchandise.points }} Points</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
    <h1 class="mt-2 text-white text-2xl font-semibold py-2" v-if="total === 0">
      We're sorry - there is currently no product which matches your requirements
    </h1>

    <PaginationBar
      :total="total ?? 0"
      v-model:page-size="page.pageSize"
      v-model:page-index="page.pageIndex"
      @switch-page="reloadSearch">
    </PaginationBar>
  </div>
</template>
