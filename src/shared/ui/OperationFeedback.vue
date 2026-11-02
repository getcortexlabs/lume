<script setup lang="ts">
import { MReveal, MCard, MRow, MIcon, MText } from "@getcortexlabs/mavis-web";
defineProps<{ message?: string; error?: string }>();
</script>
<template>
  <MReveal :show="!!(error || message)">
    <MCard
      padding="md"
      class="operation-feedback"
      :class="{ 'operation-error': !!error }"
      :style="{
        backgroundColor: error ? '#fff3ef' : 'var(--m-color-primarySoft)',
        borderColor: error ? '#e9bdb1' : 'var(--m-color-border)',
      }"
    >
      <MRow gap="md" align="start">
        <MIcon :name="error ? 'info' : 'check'" size="sm" />
        <MText
          :role="error ? 'alert' : 'status'"
          :tone="error ? 'danger' : 'text'"
          >{{ error || message }}</MText
        >
      </MRow>
    </MCard>
  </MReveal>
</template>
<style scoped>
.operation-feedback {
  margin-block: 12px;
}
.operation-error {
  color: var(--m-color-danger);
}
</style>
