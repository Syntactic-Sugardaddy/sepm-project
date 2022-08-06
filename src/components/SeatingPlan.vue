<script setup lang="ts">
import { useSeatingPlanUtils } from '@/composables/seatingPlanUtil';
import { useTextFormatter } from '@/composables/textFormatter';
import type { EventShowDetail } from '@/dtos/eventshow/event-show-detail';
import type { SeatingPlan } from '@/dtos/seatingplan/seating-plan';
import type { SeatingPlanPlace } from '@/dtos/seatingplan/seating-plan-place';
import type { SeatingPlanSector } from '@/dtos/seatingplan/seating-plan-sector';
import type { StandingCapacityDetail } from '@/dtos/seatingplan/standing-capacity-detail';
import type { TicketDetail } from '@/dtos/ticket/ticket-detail';
import type { TicketSeating } from '@/dtos/ticket/ticket-seating';

const props = defineProps<{
  seatingPlan: SeatingPlan | null;
  eventShow?: EventShowDetail | null;
  standingCapacities?: StandingCapacityDetail[] | null;
  reservation?: TicketSeating[];
  tickets?: TicketDetail[];
  ticketIds?: Set<number>;
  ticketTotal?: number;
  reservationsMap?: Map<number, TicketSeating>;
}>();

defineEmits<{
  (e: 'toggleTicket', placeId: number, sector: SeatingPlanSector, place: SeatingPlanPlace): void;
}>();

const textFormatter = useTextFormatter();
const seatinPlanUtils = useSeatingPlanUtils();

const ticketIds = computed(() => props.ticketIds ?? new Set<number>());
const reservationsMap = computed(() => props.reservationsMap ?? new Map<number, TicketSeating>());

function toPercent(value: number) {
  return value + '%';
}

function reservationToClass(seating: TicketSeating | undefined) {
  if (!seating) return 'bg-white';
  if (isFreeReservation(seating)) return 'bg-white';

  if (ticketIds.value.has(seating.id)) {
    return 'bg-blue-500';
  } else {
    return 'taken-seat';
  }
}

function isFreeReservation(reservation: TicketSeating | undefined) {
  return reservation === undefined || reservation.placeType === 'STANDING';
}

function getReservation(seatId: number) {
  return reservationsMap.value.get(seatId);
}
</script>

<template>
  <div
    v-if="seatingPlan"
    class="text-white my-4 bg-slate-800 rounded"
    :style="{
      height: '0',
      'padding-bottom': '100%',
      position: 'relative',
    }">
    <!-- for each sector -->
    <div
      v-for="sec in seatingPlan.sectors"
      :key="sec.id"
      class="rounded seating-sector"
      :class="{ 'bg-slate-600': !sec.isAvailable, 'bg-slate-500': sec.isAvailable }"
      :style="{
        position: 'absolute',
        left: toPercent(sec.x),
        top: toPercent(sec.y),
        width: toPercent(sec.width),
        height: toPercent(sec.height),
        'background-clip': 'content-box',
        border: '5px solid transparent',
        'border-radius': '10px',
      }">
      <div class="absolute w-full h-full flex justify-center items-center text-2xl" v-if="!sec.isAvailable">
        {{ sec.name }}
      </div>
      <div class="absolute w-full text-center bg-blue-500 rounded sector-bottom-text" v-else>
        <span>{{ sec.name }}</span>
        <span v-if="eventShow">{{ ` - ${textFormatter.euro(seatinPlanUtils.getPrice(sec, eventShow))}` }}</span>
      </div>

      <button
        v-for="place in sec.places"
        :key="place.id"
        class="place rounded text-black flex justify-center items-center"
        :class="[place.placeType === 'SITTING' ? reservationToClass(getReservation(place.id)) : 'bg-gray-50']"
        @click="$emit('toggleTicket', place.id, sec, place)"
        type="button"
        :title="
          place.rowName +
          (place.placeType === 'SITTING' ? ' - Seat ' + place.seatNumber : '') +
          (eventShow ? '\nPrice ' + textFormatter.euro(seatinPlanUtils.getPrice(sec, eventShow)) : '')
        "
        :style="{
          position: 'absolute',
          left: toPercent(place.x),
          top: toPercent(place.y),
          width: toPercent(place.width),
          height: toPercent(place.height),
        }">
        <div v-if="place.placeType === 'STANDING'">
          <p class="text-xl font-regular">Standing</p>
          <p class="text-xl font-regular">{{ sec.name }}</p>
          <StandingSectorInfo
            :standingCapacity="standingCapacities?.find((x) => x.seatingPlanPlaceId === place.id)"
            :tickets="tickets">
          </StandingSectorInfo>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.place {
  border: 1px solid black;
  width: 1rem;
  height: 1rem;
}
.place:hover {
  background-color: rgb(191 219 254);
  cursor: pointer;
}
.place:active {
  outline: 1px solid black;
}
.sector-bottom-text {
  display: none;
  margin-top: 10px;
  top: 100%;
}
.seating-sector:hover > .sector-bottom-text {
  display: block;
}
.place.taken-seat {
  background: repeating-linear-gradient(-45deg, rgb(15 23 42), rgb(15 23 42) 20%, rgb(59 130 246) 20%, rgb(59 130 246) 40%);
  cursor: initial;
}
</style>
