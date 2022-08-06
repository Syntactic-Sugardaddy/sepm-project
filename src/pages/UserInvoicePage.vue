<script setup lang="ts">
import { useInvoiceService } from '@/services/invoice-service';
import { useRouterRef } from '@/composables/routerRef';
import type { Page } from '@/dtos/page';
import { useErrorHandler } from '@/composables/errorHandler';
import { useInvoicePdfCreator } from '@/composables/invoicePdfCreator';
import type { InvoiceDetail } from '@/dtos/invoice/invoice-detail';

const invoiceService = useInvoiceService();
const invoices = ref<InvoiceDetail[]>([]);
const page = useRouterRef<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 }, ['pageSize']);
const total = ref<number>(0);
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const invoicePdfCreator = useInvoicePdfCreator();

const reloadInvoices = async () => {
  try {
    const data = await invoiceService.getAllByUser(page.value as Page);
    total.value = data.total;
    invoices.value = data.elements;
  } catch (error) {
    await errorHandler.error(error);
  }
};

onMounted(async () => {
  await reloadInvoices();
});
</script>

<template>
  <div class="max-w-screen-lg mx-auto mt-8">
    <h1 class="text-white bg-slate-800 rounded py-3 px-4 text-2xl text-center font-semibold">Your Invoices</h1>
    <div v-if="invoices.length > 0" class="flex flex-col mt-4 gap-2 items-center">
      <div v-for="invoice in invoices" :key="invoice.id" class="w-full">
        <div class="rounded bg-slate-800">
          <InvoiceCard :invoice="invoice" @download="invoicePdfCreator.createInvoice(invoice)"> </InvoiceCard>
        </div>
      </div>
      <PaginationBar
        :total="total"
        v-model:page-size="page.pageSize"
        v-model:page-index="page.pageIndex"
        @switch-page="reloadInvoices"
        v-if="invoices.length > 0">
      </PaginationBar>
    </div>
    <div v-else class="text-white flex justify-center bg-slate-600 m-10 rounded">
      <div class="p-5">
        <b>No Invoices linked to this account!</b>
      </div>
    </div>
  </div>
</template>
