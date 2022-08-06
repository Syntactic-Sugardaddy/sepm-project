<script setup lang="ts">
import { useTextFormatter } from '@/composables/textFormatter';
import type { EventShowDetail } from '@/dtos/eventshow/event-show-detail';

defineProps<{ item: EventShowDetail }>();

const { dateTime, euro } = useTextFormatter();
</script>

<template>
  <RouterLink :to="'/event-show/' + item.id">
    <CardBase>
      <div class="flex justify-between">
        <div>
          <p class="text-blue-400 text-lg font-semibold">{{ item.name }}</p>
          <span class="text-slate-300">Event: </span>
          <span class="font-semibold">{{ item.event.title }}</span>
          <div>
            <span class="text-slate-300">Artist: </span>

            <span class="font-medium" v-if="item.artist.stageName && item.artist.firstName && item.artist.lastName">
              {{ item.artist.stageName }} ({{ item.artist.firstName }} {{ item.artist.lastName }})
            </span>
            <span v-else-if="item.artist.stageName">
              {{ item.artist.stageName }}
            </span>
            <span v-else>
              {{ [item.artist.lastName, item.artist.firstName].filter((x) => x).join(', ') }}
            </span>
          </div>
          <p>{{ dateTime(item.startTime) }} - {{ dateTime(item.endTime) }}</p>
        </div>
        <div class="text-right">
          <span class="text-slate-300">Location: </span>
          <span class="font-medium">{{ item.location.name }}</span>
          <p>{{ item.location.country }}</p>
          <p>{{ item.location.postalCode }}, {{ item.location.city }}</p>
          <span class="text-slate-300">Tickets from: </span>
          <span class="font-semibold">{{ euro(item.price) }}</span>
        </div>
      </div>
    </CardBase>
  </RouterLink>
</template>
