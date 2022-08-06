<script setup lang="ts">
import { useInvoicePdfCreator } from '@/composables/invoicePdfCreator';
import { useTextFormatter } from '@/composables/textFormatter';
import type { InvoiceDetail } from '@/dtos/invoice/invoice-detail';
import { DocumentDownloadIcon } from '@heroicons/vue/outline';

defineProps<{
  invoice: InvoiceDetail;
}>();

defineEmits<{
  (e: 'download'): void;
}>();

const textFormatter = useTextFormatter();
const invoicePdfCreator = useInvoicePdfCreator();
</script>

<template>
  <div class="relative">
    <div class="flex items-center rounded text-white p-3">
      <div class="flex flex-col basis-1/4">
        <p v-if="invoice.invoiceType === 'CANCEL'" class="text-2xl m-auto text-blue-500">Refund</p>
        <p v-else class="text-2xl m-auto text-emerald-500">Purchase</p>
        <p class="text-slate-300 font-semibold m-auto">Invoice No.: {{ invoice.invoiceNumber }}</p>
        <p class="text-slate-300 m-auto">Date: {{ textFormatter.dateTime(invoice.invoiceDate) }}</p>
      </div>
      <div class="flex flex-col basis-1/2">
        <p class="text-xl mx-auto">
          {{ invoice.invoiceType == 'NORMAL' ? 'Paid: ' : 'Refunded:  ' }}
          {{ textFormatter.euro(invoicePdfCreator.getInvoiceTotal(invoice)) }}
        </p>
        <p v-if="invoice.paymentType != null" class="mx-auto text-xl">Payment Type: {{ invoice.paymentType }}</p>
      </div>
      <div class="basis-1/4">
        <ButtonBlue class="flex mx-auto gap-1 pl-2.5 py-2 top-8 text-white" @click="$emit('download')">
          <DocumentDownloadIcon class="text-white h-6 w-6" aria-hidden="true"></DocumentDownloadIcon>
          <span>Download</span>
        </ButtonBlue>
      </div>
    </div>
  </div>
</template>
