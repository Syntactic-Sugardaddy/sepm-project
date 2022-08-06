<script setup lang="ts">
import type { StandingCapacityDetail } from '@/dtos/seatingplan/standing-capacity-detail';
import type { TicketDetail } from '@/dtos/ticket/ticket-detail';

const props = defineProps<{
  standingCapacity: StandingCapacityDetail | undefined;
  tickets: TicketDetail[] | undefined;
}>();

const standingPlacesSelected = computed(
  () => props.tickets?.filter((x) => x.placeId === props.standingCapacity?.seatingPlanPlaceId).length
);
</script>

<template>
  <p v-if="standingCapacity" class="text-xl font-semibold">
    {{ standingCapacity.occupied }}/{{ standingCapacity.capacity }} taken
  </p>
  <p v-if="standingPlacesSelected" class="text-xl text-blue-500 font-semibold">{{ standingPlacesSelected }} selected</p>
</template>
