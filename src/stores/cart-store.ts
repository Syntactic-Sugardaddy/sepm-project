import { useAuthStore } from './auth-store';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { useCartService } from '@/services/cart-service';
import { useTicketService } from '@/services/ticket-service';
import { useOrderService } from '@/services/order-service';
import { useMerchandisePurchaseService } from '@/services/merchandise-purchase-service';
import type { OrderPaymentInfo } from '@/dtos/order/order-payment-info';
import type { TicketReservationsSearch } from '@/dtos/ticket/ticket-reservations-search';
import type { TicketReservation } from '@/dtos/ticket/ticket-reservation';
import type { MerchandisePurchase } from '@/dtos/merchandise/merchandise-purchase';
import type { OrderDetail } from '@/dtos/order/order-detail';
import type { InvoiceDetail } from '@/dtos/invoice/invoice-detail';

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore();
  const cart = ref<OrderDetail | null>();
  const cartService = useCartService();
  const loadCartPromise = loadCart();
  const ticketService = useTicketService();
  const merchandiseService = useMerchandisePurchaseService();
  const orderService = useOrderService();

  async function loadCart() {
    if (authStore.isLoggedIn) {
      cart.value = await cartService.getShoppingCart();
    } else {
      cart.value = null;
    }
  }

  const numItems = computed(() => {
    const cartValue = cart.value;
    if (cartValue) {
      return cartValue.merchandisePurchases.map((v) => v.quantity).reduce((a, b) => a + b, 0) + cartValue.tickets.length;
    } else {
      return 0;
    }
  });

  watch(() => authStore.token, loadCart);

  function thenLoadCart<T>(promise: Promise<T>): Promise<T> {
    return promise.then(async (res) => {
      await loadCart();
      return res;
    });
  }

  async function placeOrder(orderPaymentInfoDto: OrderPaymentInfo): Promise<InvoiceDetail> {
    return thenLoadCart(orderService.placeOrder(orderPaymentInfoDto));
  }
  async function cancelAndRefundTicket(id: number) {
    return thenLoadCart(ticketService.cancelTicketReservation(id));
  }
  async function cancelTicketReservation(id: number) {
    return thenLoadCart(ticketService.cancelTicketReservation(id));
  }
  async function getReservationsForSeatingPlan(searchDto: TicketReservationsSearch) {
    return thenLoadCart(ticketService.getReservationsForSeatingPlan(searchDto));
  }
  async function reserveTickets(ticketDto: TicketReservation) {
    return thenLoadCart(ticketService.reserveTickets(ticketDto));
  }

  async function addMerchandiseToCart(merchandise: MerchandisePurchase) {
    return thenLoadCart(merchandiseService.addMerchandiseProductToCart(merchandise));
  }
  async function changeMerchandiseQuantity(id: number, quantity: number) {
    return thenLoadCart(merchandiseService.changeMerchandisePurchaseQuantity(id, { quantity }));
  }
  async function removeMerchandiseFromCart(id: number) {
    return thenLoadCart(merchandiseService.removeMerchandisePurchaseFromCart(id));
  }

  return {
    placeOrder,
    cancelAndRefundTicket,
    cancelTicketReservation,
    getReservationsForSeatingPlan,
    reserveTickets,
    addMerchandiseToCart,
    changeMerchandiseQuantity,
    removeMerchandiseFromCart,
    cart,
    numItems,
    loadCartPromise,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
