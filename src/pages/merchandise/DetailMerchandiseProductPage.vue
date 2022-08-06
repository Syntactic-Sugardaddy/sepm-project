<script setup lang="ts">
import { useErrorHandler } from '@/composables/errorHandler';
import { useTextFormatter } from '@/composables/textFormatter';
import type { MerchandiseProductDetail } from '@/dtos/merchandise/merchandise-product-detail';
import { useMerchandiseProductService } from '@/services/merchandise-product-service';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';

const authStore = useAuthStore();
const route = useRoute();
const merchandiseProductId = +route.params.id;
const merchandiseProduct = ref<MerchandiseProductDetail | null>(null);

const merchandiseProductService = useMerchandiseProductService();
const merchandiseService = useCartStore();

const quantityOption = ref<
  {
    value: number;
    display: string;
  }[]
>([]);

const loadMerchandise = async () => {
  merchandiseProduct.value = await merchandiseProductService.findById(merchandiseProductId);
  quantityOption.value = Array(merchandiseProduct.value.itemsPerCustomer)
    .fill(0)
    .map((_, i) => ({
      value: i + 1,
      display: `${i + 1}`,
    }));
};
loadMerchandise();

const { euro } = useTextFormatter();

const toast = useToast();
const errorHandler = useErrorHandler(toast);

const quantity = ref<number>(1);
const usePoints = ref<boolean>(false);

const addToCart = async (usePoints: boolean) => {
  if (!merchandiseProduct.value) {
    return;
  }
  try {
    await merchandiseService.addMerchandiseToCart({
      merchandiseProductId: merchandiseProduct.value.id,
      quantity: quantity.value,
      usePoints,
    });
    toast.success(`Added ${quantity.value}x ${merchandiseProduct.value.name} to cart`);
  } catch (error) {
    await errorHandler.error(error);
  }
};
</script>

<template>
  <div class="max-w-screen-lg mx-auto">
    <div class="flex bg-slate-800 mt-8 p-8 rounded flex-col">
      <h1 class="text-white text-xl font-bold mb-4">Merchandise Product</h1>
      <div class="grid md:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
        <SystemImage v-if="merchandiseProduct" :name="merchandiseProduct.imageName" class="w-full rounded"></SystemImage>
        <div class="text-white flex flex-col gap-3" v-if="merchandiseProduct">
          <div>
            <p class="font-semibold text-2xl">{{ merchandiseProduct?.name }}</p>
            <p>{{ merchandiseProduct.stock }} left in stock</p>
            <p class="py-4">{{ merchandiseProduct.description }}</p>

            <div
              class="h-16 bg-slate-700 ring-slate-500 hover:bg-slate-600 ring-2 rounded flex p-4"
              :class="{ 'ring-emerald-600': !usePoints }"
              @click="usePoints = false">
              <input type="radio" v-model="usePoints" :value="false" />
              <div class="flex justify-between pl-2 w-full">
                <span class="text-lg">Buy with Money</span>
                <span class="text-2xl">{{ euro(merchandiseProduct.price) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div
              class="h-16 bg-slate-700 ring-slate-500 hover:bg-slate-600 ring-2 rounded flex p-4"
              @click="usePoints = true"
              :class="{ 'ring-emerald-600': usePoints }">
              <input type="radio" v-model="usePoints" :value="true" class="" />
              <div class="flex justify-between pl-2 w-full">
                <span class="text-lg">Buy with Points</span>
                <span class="text-2xl">{{ merchandiseProduct.points }} points</span>
              </div>
            </div>
          </div>

          <div class="flex gap-4 justify-between">
            <SelectBase v-model.number="quantity" :options="quantityOption" label="Quantity" class="w-20"></SelectBase>
            <div class="flex gap-4 items-center">
              <div class="text-2xl">
                Price:
                <span class="font-bold">{{
                  usePoints ? `${merchandiseProduct.points * quantity} Points` : euro(merchandiseProduct.price * quantity)
                }}</span>
              </div>
              <ButtonGreen v-if="authStore.isLoggedIn" @click="addToCart(usePoints)">Add To Cart</ButtonGreen>
              <RouterLink to="/login" v-else>
                <ButtonRed class="bg-gray-600 active:bg-gray-600">Please log in to buy</ButtonRed>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
