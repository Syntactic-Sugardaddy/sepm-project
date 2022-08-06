<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { ChevronDownIcon } from '@heroicons/vue/solid';

export interface DropdownItem {
  name: string;
  to?: string;
  click?: () => void;
}

defineProps<{
  items: DropdownItem[];
  name: string;
}>();
</script>

<template>
  <Menu as="div" class="relative inline-block text-left z-10">
    <div>
      <MenuButton
        class="inline-flex justify-center w-full rounded-md shadow-sm px-4 py-2 bg-blue-500 text-l font-medium text-white hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
        {{ name }}
        <ChevronDownIcon class="-mr-1 ml-2 mt-0.5 h-5 w-5" aria-hidden="true" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95">
      <MenuItems
        class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div class="py-1">
          <div v-for="(item, index) in items" :key="index">
            <MenuItem v-slot="{ active }">
              <div>
                <RouterLink v-if="item.to" :to="item.to" class="text-white block px-4 py-2 text-sm hover:bg-gray-700">{{
                  item.name
                }}</RouterLink>
                <button
                  type="button"
                  v-else
                  @click="item.click"
                  :class="[active ? 'bg-gray-700 ' : '']"
                  class="text-white block px-4 py-2 text-sm w-full text-left">
                  {{ item.name }}
                </button>
              </div>
            </MenuItem>
          </div>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
