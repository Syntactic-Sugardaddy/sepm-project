<script setup lang="ts">
import { useAuthStore } from '@/stores/auth-store';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { MenuIcon, XIcon } from '@heroicons/vue/outline';
import type { DropdownItem } from './DropdownMenu.vue';

const authStore = useAuthStore();

const router = useRouter();

const pages = computed(() => {
  const arr = [
    { name: 'Home', to: '/' },
    { name: 'News', to: '/news' },
    { name: 'Merchandise', to: '/merchandise' },
    { name: 'Search', to: '/search' },
  ];
  if (authStore.userRole == 'ADMIN') {
    arr.push({ name: 'Admin', to: '/admin' });
  }
  return arr;
});

const buttons = ref([
  {
    name: 'Login',
    to: '/login',
    visibleWhenLoggedIn: false,
    classes: 'ring-2 ring-inset ring-blue-500 px-6 py-2 hover:bg-gray-700 rounded text-blue-500 font-semibold',
  },
  {
    name: 'Sign Up',
    to: '/register',
    visibleWhenLoggedIn: false,
    classes: 'bg-blue-500 px-6 py-2 rounded text-black hover:bg-blue-400 fold-semibold',
  },
  {
    name: 'Cart',
    to: '/checkout',
    visibleWhenLoggedIn: true,
    classes: '',
  },
  {
    name: 'My Profile',
    children: [
      { name: 'Account Details', to: '/user-page' },
      { name: 'Your Tickets', to: '/user-tickets' },
      { name: 'Your Invoices', to: '/user-invoices' },
      { name: 'Checkout', to: '/checkout' },
      {
        name: 'Logout',
        click: () => {
          authStore.logoutUser();
          router.push('/');
        },
      },
    ] as DropdownItem[],
    to: '',
    visibleWhenLoggedIn: true,
    classes: '',
  },
]);
</script>

<template>
  <Disclosure as="nav" class="bg-gray-800 p-4 text-white" v-slot="{ open }">
    <div class="flex justify-between items-center">
      <!-- Branding -->
      <RouterLink class="font-bold text-xl flex-1" to="/">
        <img src="../assets/brand.svg" class="h-8" alt="" />
      </RouterLink>

      <!-- Desktop Items -->
      <div class="hidden sm:block sm:ml-6 max-w-lg w-full flex-1">
        <div class="flex space-x-2 justify-around">
          <RouterLink
            v-for="(page, index) in pages"
            :key="index"
            :to="page.to"
            class="font-semibold text-xl"
            active-class="text-blue-500"
            >{{ page.name }}</RouterLink
          >
        </div>
      </div>
      <div class="hidden sm:block flex-1">
        <div class="flex gap-2 justify-end">
          <span v-for="(button, index) in buttons" :key="index" class="flex items-center">
            <template v-if="button.visibleWhenLoggedIn === authStore.isLoggedIn">
              <div v-if="!button.children && button.name !== 'Cart'">
                <RouterLink :to="button.to">
                  <ButtonBase :class="button.classes">
                    {{ button.name }}
                  </ButtonBase>
                </RouterLink>
              </div>
              <div v-else-if="button.name === 'Cart'">
                <RouterLink :to="button.to">
                  <ButtonCart></ButtonCart>
                </RouterLink>
              </div>
              <div v-else-if="button.name !== 'Cart'">
                <DropdownMenu v-if="button.children" :name="button.name" :items="button.children"> </DropdownMenu>
              </div>
            </template>
          </span>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <div class="sm:hidden">
        <DisclosureButton>
          <MenuIcon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
          <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
        </DisclosureButton>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden mt-2 flex-1">
      <!-- Mobile Items -->
      <div class="flex flex-col items-end gap-1">
        <RouterLink v-for="(page, index) in pages" :key="index" :to="page.to">
          <ButtonBase class="hover:bg-slate-500">
            {{ page.name }}
          </ButtonBase>
        </RouterLink>

        <span v-for="(button, index) in buttons" :key="index">
          <template v-if="button.visibleWhenLoggedIn === authStore.isLoggedIn">
            <!--If no children => Routerlink, if children =>  -->
            <div v-if="!button.children">
              <RouterLink :to="button.to">
                <ButtonBase class="hover:bg-slate-500">{{ button.name }}</ButtonBase>
              </RouterLink>
            </div>
            <div v-else>
              <DropdownMenu :name="button.name" :items="button.children"> </DropdownMenu>
            </div>
          </template>
        </span>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>
