<script setup lang="ts">
import { CreditCardIcon } from '@heroicons/vue/outline';
import { useToast } from 'vue-toastification';
import { useCustomValidators } from '@/composables/customValidators';
import { useTextFormatter } from '@/composables/textFormatter';
import { useCartStore } from '@/stores/cart-store';
import { useErrorHandler } from '@/composables/errorHandler';
import type { PaymentType } from '@/dtos/payment-type';
import { useUserService } from '@/services/user-service';

const { notBlank } = useCustomValidators();
const cartStore = useCartStore();
const orderService = cartStore;
const ticketService = orderService;
const merchandiseService = orderService;
const toast = useToast();
const errorHandler = useErrorHandler(toast);
const router = useRouter();
const textFormatter = useTextFormatter();

const shoppingCart = computed(() => cartStore.cart);
const selectedTickets = ref<number[]>([]);
const selectedMerchandises = ref<number[]>([]);

const emptyMessage = 'No tickets currently reserved';

const userPaymentInfo = ref<{ address: string; firstName: string; lastName: string }>({
  firstName: '',
  lastName: '',
  address: '',
});

const loadUserDetails = async () => {
  const userService = useUserService();
  try {
    const user = await userService.fetchCurrentUser();

    userPaymentInfo.value.firstName = user.firstName;
    userPaymentInfo.value.lastName = user.lastName;
    userPaymentInfo.value.address = user.address;
  } catch (error) {
    errorHandler.error(error);
  }
};

loadUserDetails();

const rules = {
  firstName: { required, notBlank, maxLength: maxLength(255) },
  lastName: { required, notBlank, maxLength: maxLength(255) },
  address: { required, notBlank, maxLength: maxLength(255) },
};

const v$ = useVuelidate(rules, userPaymentInfo);

cartStore.loadCartPromise.then(() => {
  selectedTickets.value = shoppingCart.value?.tickets.map((t) => t.id) ?? [];
  selectedMerchandises.value = shoppingCart.value?.merchandisePurchases.map((t) => t.id) ?? [];
});

const priceTotal = computed(() => {
  if (shoppingCart.value) {
    const ticketsCost = shoppingCart.value.tickets
      .filter((t) => selectedTickets.value.includes(t.id))
      .reduce((prev, curr) => prev + curr.price, 0);

    const merchandiseCost = shoppingCart.value.merchandisePurchases
      .filter((t) => selectedMerchandises.value.includes(t.id))
      .filter((t) => !t.usePoints)
      .reduce((prev, curr) => prev + curr.price * curr.quantity, 0);

    return ticketsCost + merchandiseCost;
  }
  return 0;
});

const pointsTotal = computed(() => {
  if (shoppingCart.value) {
    return shoppingCart.value.merchandisePurchases
      .filter((t) => t.usePoints)
      .filter((t) => selectedMerchandises.value.includes(t.id))
      .reduce((prev, curr) => prev + curr.points * curr.quantity, 0);
  }
  return 0;
});

const selectedPaymentOption = ref<PaymentType>('DEBITCARD');

const paymentOptions = ref<
  {
    value: PaymentType;
    display: string;
  }[]
>([
  {
    value: 'VISA',
    display: 'Visa',
  },
  {
    value: 'DEBITCARD',
    display: 'Debitcard',
  },
  {
    value: 'PAYPAL',
    display: 'Paypal',
  },
]);

const canChoosePaymentOption = computed(() => priceTotal.value > 0);

const buy = async () => {
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    return;
  }
  try {
    const invoice = await orderService.placeOrder({
      userPaymentInfoDto: userPaymentInfo.value,
      paymentType: canChoosePaymentOption.value ? selectedPaymentOption.value : undefined,
      ticketIds: selectedTickets.value,
      merchandiseIds: selectedMerchandises.value,
    });
    toast.success('Your purchase was successful!');
    router.push('/invoice/' + invoice.id);
  } catch (error) {
    await errorHandler.error(error);
  }
};

const removeTicket = async (ticketId: number) => {
  try {
    selectedTickets.value = selectedTickets.value.filter((i) => i !== ticketId);
    await ticketService.cancelTicketReservation(ticketId);
  } catch (error) {
    errorHandler.error(error);
  }
};

const toggleTicketBuyState = (ticketId: number) => {
  if (selectedTickets.value.includes(ticketId)) {
    selectedTickets.value = selectedTickets.value.filter((i) => i !== ticketId);
  } else {
    selectedTickets.value.push(ticketId);
  }
};

const removeMerchandise = async (merchandiseId: number) => {
  try {
    selectedMerchandises.value = selectedMerchandises.value.filter((i) => i !== merchandiseId);
    await merchandiseService.removeMerchandiseFromCart(merchandiseId);
  } catch (error) {
    errorHandler.error(error);
  }
};

const toggleMerchandiseBuyState = (merchandiseId: number) => {
  if (selectedMerchandises.value.includes(merchandiseId)) {
    selectedMerchandises.value = selectedMerchandises.value.filter((i) => i !== merchandiseId);
  } else {
    selectedMerchandises.value.push(merchandiseId);
  }
};

const updateMerchandiseQuantity = async (merchandiseId: number, newQty: number) => {
  try {
    await merchandiseService.changeMerchandiseQuantity(merchandiseId, newQty);
  } catch (error) {
    errorHandler.error(error);
  }
};
</script>

<template>
  <div class="max-w-screen-xl m-auto">
    <div class="grid grid-cols-[1fr_2fr] gap-8 mt-14 m-auto">
      <div>
        <p class="text-white text-3xl">Enter Payment Info</p>
        <div class="bg-slate-800 rounded mt-4 p-5 pb-8 flex flex-col gap-2">
          <InputFloatingLabel
            v-model="userPaymentInfo.firstName"
            placeholder="Firstname"
            label="Firstname"
            :errors="v$.firstName.$errors"
            class=""></InputFloatingLabel>
          <InputFloatingLabel
            v-model="userPaymentInfo.lastName"
            placeholder="Lastname"
            label="Lastname"
            :errors="v$.lastName.$errors"
            class=""></InputFloatingLabel>
          <InputFloatingLabel
            v-model="userPaymentInfo.address"
            placeholder="Address"
            label="Address"
            :errors="v$.address.$errors"
            class=""></InputFloatingLabel>
        </div>
        <div class="bg-slate-800 rounded mt-4 p-5" v-if="canChoosePaymentOption">
          <SelectBase :options="paymentOptions" label="Payment Options" v-model="selectedPaymentOption"></SelectBase>
        </div>
        <div class="float-right mb-20 flex justify-end flex-col">
          <div class="mb-3">
            <p class="text-white text-3xl mt-3 text-right">
              <span class="text-xl">Total: </span>{{ textFormatter.euro(priceTotal) }}
            </p>
            <p class="text-white text-3xl text-right" v-if="pointsTotal">
              <span class="text-xl">and </span>{{ pointsTotal }} Points
            </p>
          </div>
          <div></div>
          <ButtonGreen class="flex justify-around" @click="buy">
            <CreditCardIcon class="text-white h-6 w-6" aria-hidden="true"></CreditCardIcon>
            <span class="mx-2">Buy Selected</span>
          </ButtonGreen>
        </div>
      </div>
      <div v-if="shoppingCart" class="basis-1/2">
        <p class="text-white text-3xl">Select Items for Payment</p>
        <ShoppingCart
          :tickets="shoppingCart.tickets"
          :merchandises="shoppingCart.merchandisePurchases"
          :selected-merchandises="selectedMerchandises"
          :selected-tickets="selectedTickets"
          :empty-message="emptyMessage"
          @removeTicket="removeTicket($event)"
          @removeMerchandise="removeMerchandise($event)"
          @toggleTicketBuyState="toggleTicketBuyState($event)"
          @toggleMerchandiseBuyState="toggleMerchandiseBuyState($event)"
          @updateMerchandiseQuantity="updateMerchandiseQuantity">
        </ShoppingCart>
      </div>
    </div>
  </div>
</template>
