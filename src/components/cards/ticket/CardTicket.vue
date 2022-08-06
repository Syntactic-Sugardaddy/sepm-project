<script setup lang="ts">
import { useTextFormatter } from '@/composables/textFormatter';
import type { TicketDetail } from '@/dtos/ticket/ticket-detail';
import { TrashIcon } from '@heroicons/vue/outline';

defineProps<{
  item: TicketDetail;
  removable: boolean;
}>();

defineEmits<{
  (e: 'remove'): void;
}>();

const textFormatter = useTextFormatter();
</script>

<template>
  <div class="relative">
    <div class="flex rounded text-white">
      <div class="flex flex-col basis-1/4 p-3">
        <p class="text-2xl m-auto text-blue-500" title="Show Name">{{ item.eventShow.name }}</p>
        <p class="text-slate-300 font-semibold m-auto text-center" title="Event Name">{{ item.eventShow.event.title }}</p>
        <p v-if="item.placeType === 'SITTING'" class="text-slate-300 m-auto">
          {{ item.seatingPlanRowName }}, Seat: {{ item.seatNumber }}
        </p>
        <p v-else class="text-slate-300 m-auto">Standing</p>
        <p class="text-slate-300 m-auto">{{ item.seatingPlanSectorName }}</p>
      </div>
      <div class="rounded basis-1/2 p-3">
        <p class="text-center text-xl" title="Show Starttime">{{ textFormatter.dateTime(item.eventShow.startTime) }}</p>
        <p class="text-center" title="Location Name">{{ item.eventShow.location.name }}</p>
        <p class="text-center text-slate-400">{{ item.eventShow.location.address }}</p>
        <p class="text-center text-slate-400">{{ item.eventShow.location.city }}, {{ item.eventShow.location.country }}</p>
      </div>
      <div class="flex p-3 basis-1/4 text-right">
        <p class="text-xl self-end grow">{{ textFormatter.euro(item.price) }}</p>
      </div>
    </div>
    <ButtonRed class="px-1 py-1 flex absolute top-3 right-3 text-slate-900" @click.stop="$emit('remove')" v-if="removable">
      <TrashIcon class="text-slate-900 h-6 w-6" aria-hidden="true"></TrashIcon>
    </ButtonRed>
  </div>
</template>
