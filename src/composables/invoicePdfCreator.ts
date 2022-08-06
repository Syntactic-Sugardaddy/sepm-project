import jsPDFInvoiceTemplate, { OutputType } from 'jspdf-invoice-template';
import logUrl from '@/assets/brand.png';
import { useTextFormatter } from '@/composables/textFormatter';
import type { PaymentType } from '@/dtos/payment-type';
import type { InvoiceDetail } from '@/dtos/invoice/invoice-detail';

export function useInvoicePdfCreator() {
  const textFormatter = useTextFormatter();

  const createInvoice = (invoice: InvoiceDetail) => {
    const props: Parameters<typeof jsPDFInvoiceTemplate>[0] = {
      outputType: OutputType.Save, // autosaves the invoice
      returnJsPDFDocObject: true,
      fileName: 'Invoice ' + invoice.id,
      orientationLandscape: false,
      compress: true,
      logo: {
        src: logUrl,
        type: 'PNG', //optional, when src= data:uri (nodejs case)
        width: 80, //aspect ratio = width/height
        height: 10,
        margin: {
          top: 0, //negative or positive num, from the current position
          left: 0, //negative or positive num, from the current position
        },
      },
      business: {
        name: 'Ticket Line',
        address: 'Austria, Lödersdorf 4270, Schönholdsiedlung 56b',
        phone: '(+43) 069 11 11 1111',
        email: 'ticketline@example.com',
        email_1: 'UID: 12-1234567',
        website: 'www.ticketline.al',
      },
      contact: {
        label: 'Invoice issued for:',
        name: invoice.customer.name + ' ' + invoice.customer.lastName,
        address: invoice.customer.address,
        /*
        phone: '(+43) 069 22 22 2222',
        email: 'client@website.al',
        otherInfo: 'www.website.al',*/
      },
      invoice: {
        label: 'Invoice #: ',
        num: invoice.id,
        invDate: 'Delivery date: ' + textFormatter.date(invoice.deliveryDate),
        invGenDate: 'Invoice date: ' + textFormatter.date(invoice.invoiceDate),
        headerBorder: false,
        tableBodyBorder: false,
        header: [
          {
            title: '#',
            style: {
              width: 10,
            },
          },
          {
            title: 'Qty',
            style: {
              width: 10,
            },
          },
          {
            title: 'Item',
            style: {
              width: 130,
            },
          },
          {
            title: 'Price*',
            style: {
              width: 18,
            },
          },
          { title: 'Points' },
          { title: 'VAT', style: { width: 10 } },
        ],
        table: Array.from(invoice.items, (item, index) => {
          if (item.usePoints) {
            return [index + 1, item.quantity, item.name, textFormatter.euro(0), item.points.toString(), 'None'];
          } else {
            return [index + 1, item.quantity, item.name, textFormatter.euro(item.price), '0', formatVAT(item.VAT)];
          }
        }),
        additionalRows: [
          {
            col1: 'Price Total (ex. VAT):',
            col2: textFormatter.euro(getNettoTotal(invoice)),
          },
          {
            col1: 'VAT:',
            col2: textFormatter.euro(getVATval(invoice)),
            style: {
              fontSize: 10,
            },
          },
          {
            col1: invoice.invoiceType == 'NORMAL' ? 'Price Total:' : 'Refund Total:',
            col2: textFormatter.euro(getInvoiceTotal(invoice)),
            style: {
              fontSize: 14,
            },
          },

          {
            col1: invoice.invoiceType == 'NORMAL' ? 'Points Total:' : 'Total Points Refund:',
            col2: getInvoiceTotalPoints(invoice).toString() + ' Points',
            style: {
              fontSize: 14,
            },
          },
        ] as any,
        invDesc:
          invoice.invoiceType == 'NORMAL' && invoice.paymentType
            ? 'Payment method: ' + formatPaymentType(invoice.paymentType)
            : '',
      },
      footer: {
        text: '*Prices are displayed with VAT inclusive. \n The invoice is created on a computer and is valid without a signature and stamp.',
      },
      pageEnable: true,
      pageLabel: 'Page ',
    };
    jsPDFInvoiceTemplate(props); //returns number of pages created
  };

  function getNettoTotal(invoice: InvoiceDetail) {
    //Ticket price includes the VAT                                                       price = base + base*vat (solve for base)
    return invoice.items
      .filter((item) => !item.usePoints)
      .reduce((prev, curr) => prev + (curr.price / (1 + curr.VAT / 100)) * curr.quantity, 0);
  }
  function getInvoiceTotalPoints(invoice: InvoiceDetail) {
    return invoice.items.filter((item) => item.usePoints).reduce((prev, curr) => prev + curr.points * curr.quantity, 0);
  }

  function getVATval(invoice: InvoiceDetail) {
    return getInvoiceTotal(invoice) - getNettoTotal(invoice);
  }

  function getInvoiceTotal(invoice: InvoiceDetail) {
    return invoice.items.filter((item) => !item.usePoints).reduce((prev, curr) => prev + curr.price * curr.quantity, 0);
  }
  function formatVAT(vat: number) {
    return vat + '%';
  }
  function formatPaymentType(paymentType: PaymentType) {
    if (paymentType == 'VISA') {
      return 'Visa';
    } else if (paymentType == 'DEBITCARD') {
      return 'Debit cart';
    } else if (paymentType == 'PAYPAL') {
      return 'Paypal';
    } else {
      return 'Unknown';
    }
  }

  return {
    createInvoice,
    getInvoiceTotal,
  };
}
