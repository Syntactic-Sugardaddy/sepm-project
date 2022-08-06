<script setup lang="ts">
import { useCartStore } from '@/stores/cart-store';

const cartStore = useCartStore();
</script>

<template>
  <ButtonBase class="px-5 badge" :value="cartStore.numItems">
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-cart2" viewBox="0 0 16 16">
      <path
        d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
    </svg>
  </ButtonBase>
</template>

<style scoped>
.bi-cart2 {
  width: 2rem;
  height: 2rem;
}
/* Cart Badge contains number of items in cart */
.badge:after {
  /* we want the badge to be displayed after displaying the cart icon */
  content: attr(value);
  color: #fff;
  background: rgb(244 63 94);
  border-radius: 50%;
  padding: 0 0.5rem;
  position: absolute;
  top: 2rem;
  opacity: 0.9;
}
svg:hover {
  fill: rgb(59 130 246);
}
</style>
