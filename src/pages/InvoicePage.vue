<script setup lang="ts">
import { useInvoiceService } from '@/services/invoice-service';
import { useErrorHandler } from '@/composables/errorHandler';
import { useInvoicePdfCreator } from '@/composables/invoicePdfCreator';
import type { InvoiceDetail } from '@/dtos/invoice/invoice-detail';

const toast = useToast();
const route = useRoute();

const thanksMessage = 'Thank you for your purchase.';
const pointInfoMessage =
  'For each bought item, you will be awarded points equal to its price in Euro (only full points are awarded - no fractions). Points can be exchanged for merchandise products. Please keep in mind that points for tickets will be awarded after the reservation and cancellation deadline has passed.';
const invoiceMessage = 'Be sure to save your invoice.';

const errorHandler = useErrorHandler(toast);
const invoiceId = +route.params.id;
const invoice = ref<InvoiceDetail | null>(null);
const invoiceService = useInvoiceService();
const invoicePdfCreator = useInvoicePdfCreator();
const typeCheck = computed(() => invoice.value?.invoiceType == 'NORMAL');
const loadInvoice = async () => {
  try {
    invoice.value = await invoiceService.getById(invoiceId);
  } catch (error) {
    await errorHandler.error(error);
  }
};
loadInvoice();
</script>

<template>
  <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-8">
    <div class="max-w-md w-full space-y-8 bg-slate-800 rounded p-6 text-white">
      <div v-if="typeCheck" class="flex flex-col gap-3">
        <p class="text-white text-xl font-semibold whitespace-pre-line">{{ thanksMessage }}</p>
        <p class="text-white text-md whitespace-pre-line">{{ pointInfoMessage }}</p>
        <p class="text-white text-xl whitespace-pre-line">{{ invoiceMessage }}</p>
      </div>
      <div v-else class="text-lg">
        <p>Your cancellation is being processed,</p>
        <p>please save your refund invoice!</p>
      </div>
      <button-blue @click="invoice ? invoicePdfCreator.createInvoice(invoice) : 1"
        >Download {{ typeCheck ? 'Invoice' : 'Refund Invoice' }}
      </button-blue>
    </div>
  </div>
</template>
