/** File Hash: 74f78a4f746b338a41a4bd6e0bd221bc56385e47529a165be81c9ef8d7dfb708 */

/** Autogenerated Code - Do Not Touch */
/* eslint-disable */

import type { Customer } from "@/dtos/invoice/customer"
import type { InvoiceItem } from "@/dtos/invoice/invoice-item"
import type { PaymentType } from "@/dtos/payment-type"
import type { IsoDateTimeString } from "@/dtos/iso-date-time-string"
import type { InvoiceType } from "@/dtos/invoice-type"

export interface InvoiceDetail {
  id: number;
  customer: Customer;
  items: InvoiceItem[];
  paymentType?: PaymentType;
  invoiceDate: IsoDateTimeString;
  deliveryDate: IsoDateTimeString;
  invoiceNumber: number;
  invoiceType: InvoiceType;
}
