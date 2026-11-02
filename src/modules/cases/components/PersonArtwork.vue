<script setup lang="ts">
defineProps<{ initials: string; color: string; compact?: boolean }>();
</script>
<template>
  <div
    class="person-art"
    :class="[color, { compact }]"
    role="img"
    aria-label="Ilustração de perfil fictício"
  >
    <svg viewBox="0 0 300 240" fill="none" aria-hidden="true">
      <circle
        cx="150"
        cy="120"
        r="100"
        stroke="currentColor"
        stroke-opacity=".16"
      />
      <circle
        cx="150"
        cy="120"
        r="78"
        stroke="currentColor"
        stroke-opacity=".12"
      />
      <path
        d="M48 240c6-67 43-100 102-100s96 33 102 100"
        fill="currentColor"
        opacity=".12"
      />
      <circle cx="150" cy="95" r="42" fill="currentColor" opacity=".17" />
      <path
        d="M0 204 300 44M0 220 300 60"
        stroke="currentColor"
        stroke-opacity=".04"
      /></svg
    ><span class="person-initials">{{ initials }}</span
    ><span v-if="!compact" class="art-label">PERFIL ILUSTRATIVO</span>
  </div>
</template>
