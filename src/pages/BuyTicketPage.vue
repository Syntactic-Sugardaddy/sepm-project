<script setup lang="ts">
import type { EventShowDetail } from '@/dtos/eventshow/event-show-detail';
import type { SeatingPlanSector } from '@/dtos/seatingplan/seating-plan-sector';
import type { TicketSeating } from '@/dtos/ticket/ticket-seating';
import { useEventShowService } from '@/services/event-show-service';
import type { SeatingPlan } from '@/dtos/seatingplan/seating-plan';
import { useSeatingPlanService } from '@/services/seating-plan-service';
import type { TicketDetail } from '@/dtos/ticket/ticket-detail';
import type { SeatingPlanPlace } from '@/dtos/seatingplan/seating-plan-place';
import { useCartStore } from '@/stores/cart-store';
import { useErrorHandler } from '@/composables/errorHandler';
import type { StandingCapacitySearch } from '@/dtos/seatingplan/standing-capacity-search';
import { useTextFormatter } from '@/composables/textFormatter';
import { useSeatingPlanUtils } from '@/composables/seatingPlanUtil';
import type { StandingCapacityDetail } from '@/dtos/seatingplan/standing-capacity-detail';
import { parseISO } from 'date-fns';

const eventShowService = useEventShowService();
const ticketService = useCartStore();
const seatingPlanService = useSeatingPlanService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const textFormatter = useTextFormatter();
const seatinPlanUtils = useSeatingPlanUtils();

const route = useRoute();
const eventShowId = ref<number>(+route.params.id);

const eventShow = ref<EventShowDetail | null>(null);
const loadEventShow = async () => {
  try {
    eventShow.value = await eventShowService.findById(eventShowId.value);
  } catch (error) {
    await errorHandler.error(error);
  }
};
loadEventShow();
const hasHappened = computed(() => {
  const eventShowValue = eventShow.value;
  if (!eventShowValue) return false;
  const eventShowStartTime = parseISO(eventShowValue.startTime);
  return eventShowStartTime.valueOf() < new Date().valueOf();
});

const standingCapacities = ref<StandingCapacityDetail[] | null>(null);
const seatingPlan = ref<SeatingPlan | null>(null);
const loadSeatingPlan = async () => {
  try {
    seatingPlan.value = await seatingPlanService.findByEventShow(eventShowId.value);
    await loadReservations(seatingPlan.value.id, eventShowId.value);
    standingCapacities.value = await seatingPlanService.getStandingPlaceCapacity({
      eventShowId: eventShowId.value,
      seatingPlanId: seatingPlan.value.id,
    } as StandingCapacitySearch);
  } catch (error) {
    await errorHandler.error(error);
  }
};
loadSeatingPlan();

const reservations = ref<TicketSeating[]>([]);
const loadReservations = async (seatingPlanId: number, eventShowId: number) => {
  try {
    reservations.value = await ticketService.getReservationsForSeatingPlan({ seatingPlanId, eventShowId });
  } catch (error) {
    await errorHandler.error(error);
  }
};

const seatingPlanPlaceMap = computed<Map<number, SeatingPlanPlace>>(() => {
  const seatingPlanValue = seatingPlan.value;
  if (!seatingPlanValue) {
    return new Map();
  }
  return new Map(seatingPlanValue.sectors.flatMap((sector) => sector.places.map((place) => [place.id, place])));
});

const tickets = ref<TicketDetail[]>([]);

const ticketIds = computed(() => new Set(tickets.value.map((ticket) => ticket.id)));

const emptyMessage = 'No tickets currently chosen';

const ticketTotal = computed(() => tickets.value.reduce((prev, curr) => prev + curr.price, 0));

let currTicketId = 0;

const toggleTicket = (placeId: number, sector: SeatingPlanSector, place: SeatingPlanPlace) => {
  if (hasHappened.value) {
    toast.error('Cannot reserve tickets after the event has started');
    return;
  }

  const existingReservation = localSelectionsMap.value.get(placeId);
  if (existingReservation && existingReservation.placeType != 'STANDING') {
    removeTicket(existingReservation.id);
  } else {
    if (!seatinPlanUtils.isFreeReservation(getReservation(placeId))) {
      return;
    }
    const eventShowValue = eventShow.value;
    if (!eventShowValue) {
      return;
    }
    const price = seatinPlanUtils.getPrice(sector, eventShowValue);
    tickets.value.push({
      id: currTicketId++,
      price: price,
      placeId: place.id,
      ticketState: 'RESERVED',
      placeType: place.placeType,
      seatingPlanRowName: place.rowName,
      seatingPlanSectorName: sector.name,
      seatNumber: place.seatNumber,
      eventShow: eventShowValue,
    });
  }
};

const removeTicket = (ticketId: number) => {
  tickets.value = tickets.value.filter((t) => t.id !== ticketId);
};

const localSelectionsMap = computed(() => {
  return new Map<number, TicketSeating>(
    tickets.value.map(
      (v) =>
        [
          v.placeId,
          {
            id: v.id,
            placeId: v.placeId,
            placeType: seatingPlanPlaceMap.value.get(v.placeId)?.placeType ?? 'SITTING',
            ticketState: 'RESERVED',
          } as TicketSeating,
        ] as const
    )
  );
});

const reservationsMap = computed(() => {
  return new Map<number, TicketSeating>(
    [...localSelectionsMap.value.entries()]
      .map(([key, value]) => [key, value] as const)
      .concat(reservations.value.map((v) => [v.placeId, v]))
  );
});

function getReservation(seatId: number) {
  return reservationsMap.value.get(seatId);
}

const router = useRouter();

const reserveTickets = async () => {
  if (tickets.value.length < 1) {
    toast.info('Please select Tickets');
  } else {
    try {
      const eventShowValue = eventShow.value;
      if (eventShowValue) {
        await ticketService.reserveTickets({
          eventShowId: eventShowValue?.id,
          seatingPlanPlaceIds: tickets.value.map((t) => t.placeId),
        });
      }
      toast.success('Tickets reserved.\nPlease pick up your tickets 30 minutes before the show starts.');
      await router.push('/checkout');
    } catch (error) {
      await errorHandler.error(error);
    }
  }
};
</script>

<template>
  <div class="max-w-screen-xl m-auto">
    <div class="flex flex-row gap-4 mt-8">
      <div class="basis-1/2" :style="{ position: 'relative' }">
        <p class="text-white text-3xl">Seating Plan for {{ eventShow?.name }}</p>
        <CardBase v-if="eventShow" class="bg-slate-800 flex justify-between mt-2 hover:bg-slate-800">
          <div>
            <div>
              <span class="text-slate-300">Start time: </span>
              <span class="font-semibold">{{ textFormatter.dateTime(eventShow.startTime) }}</span>
            </div>
            <div>
              <span class="text-slate-300">Event: </span>
              <span class="font-semibold">{{ eventShow.event.title }}</span>
            </div>
            <div v-if="eventShow.artist.stageName">
              <span class="text-slate-300">Artist: </span>
              <span class="font-semibold">{{ eventShow.artist.stageName }}</span>
            </div>
            <p v-else>Artist: {{ [eventShow.artist.lastName, eventShow.artist.firstName].filter((x) => x).join(', ') }}</p>
          </div>
          <div>
            <div class="text-right">
              <span class="text-slate-300">Location: </span>
              <span class="font-semibold">{{ eventShow.location.name }}</span>
            </div>
            <p class="text-right">{{ eventShow.location.postalCode }}, {{ eventShow.location.city }}</p>
            <p class="text-right">{{ eventShow.location.country }}</p>
          </div>
        </CardBase>
        <SeatingPlan
          :seatingPlan="seatingPlan"
          :eventShow="eventShow"
          :standingCapacities="standingCapacities"
          :reservations="reservations"
          :tickets="tickets"
          :ticketIds="ticketIds"
          :ticketTotal="ticketTotal"
          :reservationsMap="reservationsMap"
          @toggleTicket="toggleTicket">
        </SeatingPlan>
      </div>

      <div class="basis-1/2" v-if="!hasHappened">
        <p class="text-white text-3xl">Select Tickets for Reservation</p>
        <TotalWithButton v-if="!hasHappened" :ticketIds="ticketIds" :ticketTotal="ticketTotal" @reserve="reserveTickets">
        </TotalWithButton>
        <ShoppingCart :tickets="tickets" @removeTicket="removeTicket($event)" :emptyMessage="emptyMessage" class="mt-3">
        </ShoppingCart>
        <TotalWithButton
          v-if="ticketIds.size > 6 && !hasHappened"
          :ticketIds="ticketIds"
          :ticketTotal="ticketTotal"
          @reserve="reserveTickets">
        </TotalWithButton>
      </div>
      <div class="basis-1/2" v-else>
        <p class="text-white text-3xl">This show has already happened.</p>
        <p class="text-white">No more seats can be reserved for it.</p>
      </div>
    </div>
  </div>
</template>
