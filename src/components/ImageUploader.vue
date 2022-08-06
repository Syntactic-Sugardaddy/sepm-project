<script setup lang="ts">
import { useErrorHandler } from '@/composables/errorHandler';
import { useImageUploader } from '@/composables/imageUploader';
import type { ImageMedia } from '@/dtos/image-media';
import { useImageMediaService } from '@/services/image-media-service';
import { XIcon } from '@heroicons/vue/outline';

const file = ref<File | null>(null);
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const imageUploader = useImageUploader(toast, errorHandler);
const imageService = useImageMediaService();

const props = defineProps<{ label: string; image: ImageMedia | null }>();

const emits = defineEmits<{
  (e: 'update:image', image: ImageMedia | null): void;
}>();

watch(file, async () => {
  try {
    if (file.value && !props.image) {
      const uploaded = await imageUploader.upload(file.value);
      emits('update:image', uploaded);
    } else if (!file.value && props.image) {
      await imageService.remove(props.image.name);
      emits('update:image', null);
    }
  } catch (error) {
    errorHandler.error(error);
  }
});

const active = ref(false);

const toggleActive = () => {
  active.value = !active.value;
};

const drop = (event: DragEvent) => {
  file.value = event.dataTransfer?.files?.[0] || null;
  toggleActive();
};

const removeImage = async () => {
  if (props.image) {
    try {
      await imageService.remove(props.image.name);
      emits('update:image', null);
    } catch (error) {
      errorHandler.error(error);
    }
  }
};
</script>

<template>
  <div>
    <label class="block text-white font-bold py-3"> {{ label }} </label>
    <!-- Drop zone -->
    <div
      @dragenter.prevent="toggleActive"
      @dragleave.prevent="toggleActive"
      @drop.prevent="drop"
      :class="{ 'border-gray-200 bg-slate-500': active }"
      @dragover.prevent
      class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
      v-if="!image">
      <!-- Upload Image  -->
      <div class="space-y-1 text-center">
        <!-- Image Upload Icon -->
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>

        <!-- Inner Upload Button and text -->
        <div class="flex text-sm text-gray-400 content-center">
          <label
            for="file-upload"
            class="relative cursor-pointer p-1 bg-slate-700 rounded-md font-medium text-white hover:text-gray-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
            <span>Upload a file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              class="sr-only"
              @change="(event) => file = (event.target as HTMLInputElement)?.files?.[0] || null"
              accept="image/png" />
          </label>
          <p class="pl-1">or drag and drop</p>
        </div>
        <p class="text-xs text-white">PNG up to 1MB</p>
      </div>

      <!-- Display uploaded image -->
    </div>
    <div class="border-solid border-gray-300 border-2 rounded relative h-96" v-else>
      <SystemImage :name="image.name" class="m-auto h-full"></SystemImage>
      <ButtonRed class="px-1 py-1 flex absolute -top-3 -right-3 text-slate-900 rounded-full" @click="removeImage">
        <XIcon class="text-slate-900 h-6 w-6" aria-hidden="true"></XIcon>
      </ButtonRed>
    </div>
  </div>
</template>
