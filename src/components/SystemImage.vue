<script setup lang="ts">
import { findBackendUrl } from '@/services/service';

defineProps<{ name: string }>();

const imagesBackendUrl = new URL('api/v1/images', import.meta.url).href;
</script>
<template>
  <img :src="imagesBackendUrl + '/' + name" v-bind="$attrs" />
</template>
