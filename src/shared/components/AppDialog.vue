<script setup lang="ts">
import { MSheet } from "@getcortexlabs/mavis-web";
defineProps<{ open: boolean; title: string }>();
const emit = defineEmits<{ close: [] }>();
</script>
<template>
  <MSheet
    :open="open"
    :title="title"
    close-label="Fechar"
    padding="lg"
    gap="md"
    @update:open="
      (value) => {
        if (!value) emit('close');
      }
    "
  >
    <slot />
  </MSheet>
</template>
