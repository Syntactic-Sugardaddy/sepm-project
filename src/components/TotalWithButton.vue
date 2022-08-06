<script setup lang="ts">
import { useTextFormatter } from '@/composables/textFormatter';

const textFormatter = useTextFormatter();

defineProps<{
  ticketIds: Set<number>;
  ticketTotal: number;
}>();

defineEmits<{
  (e: 'reserve'): void;
}>();
</script>

<template>
  <div class="flex justify-between mt-2">
    <div class="bg-slate-700 rounded w-full flex justify-between p-3">
      <div>
        <span class="text-white text-lg"
          >Total for {{ ticketIds.size }} Selected Ticket{{ ticketIds.size !== 1 ? 's' : '' }}:
        </span>
        <span class="text-white text-2xl font-semibold">{{ textFormatter.euro(ticketTotal) }}</span>
      </div>
      <ButtonBlue class="text-white hover:ring-offset-slate-700" @click="$emit('reserve')">Reserve Selected Tickets</ButtonBlue>
    </div>
  </div>
</template>
