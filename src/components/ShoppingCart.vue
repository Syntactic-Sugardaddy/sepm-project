<script setup lang="ts">
import type { MerchandisePurchaseDetail } from '@/dtos/merchandise/merchandise-purchase-detail';
import type { TicketDetail } from '@/dtos/ticket/ticket-detail';

const props = defineProps<{
  tickets: TicketDetail[];
  selectedTickets?: number[];
  merchandises?: MerchandisePurchaseDetail[];
  selectedMerchandises?: number[];
  emptyMessage?: string;
}>();
defineEmits<{
  (e: 'removeTicket', ticketId: number): void;
  (e: 'removeMerchandise', merchandiseId: number): void;
  (e: 'toggleTicketBuyState', ticketId: number): void;
  (e: 'toggleMerchandiseBuyState', merchandiseId: number): void;
  (e: 'updateMerchandiseQuantity', merchandiseId: number, quantiy: number): void;
}>();

const eventTickets = computed(() => props.tickets);
</script>

<template>
  <div>
    <span class="text-white text-2xl">Event Tickets</span>
    <div v-for="ticket in eventTickets" :key="ticket.id" class="text-white">
      <CardTicket
        :item="ticket"
        :removable="true"
        @click="$emit('toggleTicketBuyState', ticket.id)"
        @remove="$emit('removeTicket', ticket.id)"
        :class="[
          selectedTickets?.includes(ticket.id) ? 'outline outline-2 outline-emerald-500 outline-offset-2' : 'bg-slate-800',
        ]"
        class="bg-slate-800 hover:bg-slate-700 transition rounded my-4">
      </CardTicket>
    </div>

    <div v-if="eventTickets.length === 0" class="text-white italic">{{ emptyMessage }}</div>
    <template v-if="(merchandises?.length || 0) > 0">
      <span class="text-white text-2xl">Merchandises</span>
      <div v-for="merchandise in merchandises" :key="merchandise.id">
        <CardMerchandise
          :item="merchandise"
          @click="$emit('toggleMerchandiseBuyState', merchandise.id)"
          @remove="$emit('removeMerchandise', merchandise.id)"
          @update-quantity="$emit('updateMerchandiseQuantity', merchandise.id, $event)"
          :class="[
            selectedMerchandises?.includes(merchandise.id)
              ? 'outline outline-2 outline-emerald-500 outline-offset-2'
              : 'bg-slate-800',
          ]"
          class="bg-slate-800 hover:bg-slate-700 transition rounded my-4">
        </CardMerchandise>
      </div>
    </template>
  </div>
</template>
