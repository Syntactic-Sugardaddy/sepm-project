<script setup lang="ts">
import { useUserService } from '@/services/user-service';
import CardTicket from '../components/cards/ticket/CardTicket.vue';
import { useTicketService } from '@/services/ticket-service';
import { useToast } from 'vue-toastification';
import { useErrorHandler } from '@/composables/errorHandler';
import type { TicketState } from '@/dtos/ticket-state';
import type { TicketDetail } from '@/dtos/ticket/ticket-detail';
import { isAfter, parseISO } from 'date-fns';
import { useCartStore } from '@/stores/cart-store';
import type { Page } from '@/dtos/page';
import type { TicketSearch } from '@/dtos/ticket/ticket-search';
import { useDebounceWatcher } from '@/composables/debounceWatcher';

const userService = useUserService();
const ticketService = useTicketService();
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const router = useRouter();
const isOpen = ref<boolean>(false);
const ticketInfo = ref<string>('');
const cancelId = ref<number>(-1);
const messages = {
  question: 'Are you sure you want to refund this ticket?',
  positive: 'Refund',
  negative: 'Cancel',
};
const ticketState = '';
const cartStore = useCartStore();

const searchParams = ref<TicketSearch>({ state: 'RESERVED' });

const tickets = ref<TicketDetail[]>([]);

const total = ref<number>(0);
const page = ref<Page>({ pageIndex: 0, pageSize: 10 });

const filters = ref<TicketState[]>(['RESERVED', 'BOUGHT']);
const filterNames = ref<Map<TicketState, string>>(
  new Map([
    ['RESERVED', 'Reserved'],
    ['BOUGHT', 'Bought'],
  ])
);
const currFilter = ref<TicketState>('RESERVED');

async function cancel(id: number) {
  try {
    const invoice = await ticketService.cancelAndRefundTicket(id);
    router.push('/invoice/' + invoice.id);
  } catch (error) {
    await errorHandler.error(error);
  }
}

async function cancelReservation(id: number) {
  try {
    await cartStore.cancelTicketReservation(id);
    tickets.value = tickets.value.filter((x) => x.id != id);
    toast.success('Your ticket reservation was successfully cancelled.');
  } catch (error) {
    await errorHandler.error(error);
  }
}

const reloadTickets = async () => {
  try {
    const data = await userService.fetchTicketsByUser(searchParams.value, page.value);
    total.value = data.total;
    tickets.value = data.elements;
  } catch (error) {
    await errorHandler.error(error);
  }
};
reloadTickets();

useDebounceWatcher(searchParams, reloadTickets, 100);
</script>

<template>
  <DialogConfirm
    :isOpen="isOpen"
    :messages="messages"
    :itemName="ticketInfo"
    @accepted="
      async () => {
        if (ticketState == 'BOUGHT') {
          await cancel(cancelId);
        }
        if (ticketState == 'RESERVED') {
          await cancelReservation(cancelId);
        }
        isOpen = false;
      }
    "
    @canceled="() => (isOpen = false)">
  </DialogConfirm>
  <div class="max-w-screen-lg mx-auto mt-8">
    <h1 class="text-white bg-slate-800 rounded py-3 px-4 text-2xl text-center font-semibold">Your Tickets</h1>
    <div class="flex justify-center bg-slate-700 p-1 rounded text-white font-bold mt-4">
      <ButtonBase
        v-for="filter in filters"
        :key="filter"
        class="py-2 rounded flex-1 text-center"
        :class="{ 'bg-blue-500': searchParams.state === filter }"
        @click="searchParams.state = filter">
        {{ filterNames.get(filter) }}
      </ButtonBase>
    </div>

    <div class="flex flex-col gap-2 my-4" v-if="tickets.length > 0">
      <div v-for="ticket in tickets" :key="ticket.id" class="bg-slate-800 rounded relative">
        <CardTicket :item="ticket" :removable="false"></CardTicket>
        <ButtonRed
          class="absolute top-3 right-3"
          v-if="ticket.ticketState === 'RESERVED'"
          @click="
            () => {
              messages.question = 'Are you sure you want to cancel this reservation?';
              ticketInfo = `Show: ${ticket.eventShow.name} (${ticket.seatingPlanSectorName}, ${ticket.seatingPlanRowName}, Place ${ticket.seatNumber})`;
              isOpen = true;
              cancelId = ticket.id;
              ticketState = 'RESERVED';
            }
          "
          >Cancel</ButtonRed
        >
        <ButtonRed
          class="absolute top-3 right-3"
          v-if="ticket.ticketState === 'BOUGHT'"
          :title="isAfter(parseISO(ticket.eventShow.startTime), new Date()) ? '' : 'The show for this ticket already occurred!'"
          :disabled="!isAfter(parseISO(ticket.eventShow.startTime), new Date())"
          @click="
            () => {
              isOpen = true;
              ticketInfo = `Show: ${ticket.eventShow.name} (${ticket.seatingPlanSectorName}, ${ticket.seatingPlanRowName}, Place ${ticket.seatNumber})`;
              cancelId = ticket.id;
              ticketState = 'BOUGHT';
            }
          "
          >Cancel</ButtonRed
        >
      </div>
    </div>
    <p v-else class="text-white flex justify-center bg-slate-600 py-3 mt-5 font-semibold rounded">
      No {{ filterNames.get(currFilter)?.toLowerCase() }} Tickets linked to this account
    </p>

    <PaginationBar
      :total="total"
      v-model:page-size="page.pageSize"
      v-model:page-index="page.pageIndex"
      @switch-page="reloadTickets">
    </PaginationBar>
  </div>
</template>
