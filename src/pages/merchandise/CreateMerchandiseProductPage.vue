<script setup lang="ts">
import { useCustomValidators } from '@/composables/customValidators';
import { useErrorHandler } from '@/composables/errorHandler';
import type { ImageMedia } from '@/dtos/image-media';
import { useMerchandiseProductService } from '@/services/merchandise-product-service';

const newMerchandise = ref<{
  name: string;
  description: string;
  price: number;
  points: number;
  stock: number;
  itemsPerCustomer: number;
  image: ImageMedia | null;
}>({
  name: '',
  description: '',
  price: 0,
  points: 0,
  stock: 1,
  itemsPerCustomer: 1,
  image: null,
});

const toast = useToast();
const errorHandler = useErrorHandler(toast);

const { notBlank } = useCustomValidators();

const rules = {
  name: { required, notBlank, maxLength: maxLength(255) },
  description: { required, maxLength: maxLength(255) },
  price: { required, minValue: minValue(0) },
  points: { required, minValue: minValue(0) },
  stock: { required, minValue: minValue(1) },
  itemsPerCustomer: { required, minValue: minValue(1) },
  image: { required },
};

const v$ = useVuelidate(rules, newMerchandise);

const merchandiseProductService = useMerchandiseProductService();

const router = useRouter();

const addMerchandiseItem = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    toast.error('Product not created - please check your inputs');
    return;
  }
  try {
    if (newMerchandise.value.image === null) {
      return;
    }

    await merchandiseProductService.create({
      name: newMerchandise.value.name,
      description: newMerchandise.value.description,
      points: newMerchandise.value.points,
      price: newMerchandise.value.price,
      stock: newMerchandise.value.stock,
      itemsPerCustomer: newMerchandise.value.itemsPerCustomer,
      imageId: newMerchandise.value.image.id,
    });
    toast.success('successfully created item');
    router.push('/merchandise');
  } catch (error) {
    errorHandler.error(error);
  }
};
</script>

<template>
  <div class="rounded max-w-screen-lg mx-auto bg-slate-800 p-8 mt-8">
    <h1 class="font-bold text-2xl text-white mb-4">Create a Merchandise Product</h1>
    <form @submit.prevent class="flex flex-col gap-5">
      <InputFloatingLabel label="Name" placeholder="Name" v-model="newMerchandise.name" :errors="v$.name.$errors" />
      <InputFloatingLabel
        label="Description"
        placeholder="Description"
        v-model="newMerchandise.description"
        :errors="v$.description.$errors" />
      <div class="flex gap-4">
        <InputCurrency label="Price" placeholder="Price" v-model="newMerchandise.price" :errors="v$.price.$errors" />
        <InputFloatingLabel label="Points" placeholder="Points" v-model="newMerchandise.points" :errors="v$.points.$errors" />
        <InputFloatingLabel label="Stock" placeholder="Stock" v-model="newMerchandise.stock" :errors="v$.stock.$errors">
        </InputFloatingLabel>
        <InputFloatingLabel
          label="Items Per Customer"
          placeholder="Items Per Customer"
          v-model="newMerchandise.itemsPerCustomer"
          :errors="v$.itemsPerCustomer.$errors"></InputFloatingLabel>
      </div>

      <ImageUploader label="Image" v-model:image="newMerchandise.image"></ImageUploader>
      <span class="text-rose-500 text-sm block" v-for="error of v$.image.$errors" :key="error.$uid"> {{ error.$message }}</span>
      <div class="flex justify-end">
        <ButtonGreen @click="addMerchandiseItem">Create Merchandise</ButtonGreen>
      </div>
    </form>
  </div>
</template>
