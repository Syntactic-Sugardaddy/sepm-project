<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  messages: {
    question: string;
    positive: string;
    negative: string;
  };
  itemName?: string;
}>();

defineEmits<{
  (e: 'accepted'): void;
  (e: 'canceled'): void;
}>();
</script>

<template>
  <dialog class="z-10 fixed top-0 bottom-0 max-w-lg p-0 bg-transparent" :open="isOpen">
    <div class="flex flex-col bg-slate-900 border rounded p-6 text-white shadow-md shadow-slate-900 my-auto">
      <p class="font-medium text-xl text-white">{{ messages.question }}</p>
      <p class="font-regular mt-2 text-xl text-white">{{ itemName }}</p>
      <div class="flex justify-end mt-8 space-x-3">
        <button-base
          class="hover:ring-2 hover:ring-offset-slate-900 hover:ring-rose-500 hover:ring-offset-2"
          @click="$emit('canceled')"
          >{{ messages.negative }}
        </button-base>
        <button-blue @click="$emit('accepted')">{{ messages.positive }}</button-blue>
      </div>
    </div>
  </dialog>
</template>
