<script setup lang="ts">
defineProps<{
  headers: string[];
  objectArray: any[];
  shownFields: string[];
  totalNumberOf: number;
  pageSize: number;
  newEventShowProperty: number | null;
}>();

defineEmits<{
  (e: 'setId', id: number): void;
}>();
</script>

<template>
  <div>
    <table class="text-white w-full table-fixed mt-4">
      <thead>
        <th v-for="(header, index) in headers" :key="index" class="border-2 bg-slate-700 border-slate-600 text-left p-1.5">
          {{ header }}
        </th>
      </thead>
      <tbody>
        <tr
          v-for="(object, index) in objectArray"
          :key="index"
          @click="$emit('setId', object.id)"
          :class="object.id == newEventShowProperty ? 'bg-emerald-700' : 'hover:bg-slate-700'">
          <td v-for="(field, index) in shownFields" :key="index" class="border-2 border-slate-700 p-1.5">
            {{ object[field] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="text-white">
      <div v-if="totalNumberOf > pageSize" class="text-white p-3 italic mx-auto">
        ... and {{ totalNumberOf - pageSize }} more result(s)
      </div>
      <div v-if="totalNumberOf === 0" class="text-white p-3 italic mx-auto">No results matching the given filters.</div>
    </div>
  </div>
</template>
