<script setup lang="ts">
import { MCard, MBadge, MText, MButton } from "@getcortexlabs/mavis-web";
import type { FollowUpTask } from "../domain/operations";
defineProps<{ task: FollowUpTask; busy: boolean }>();
defineEmits<{ updateSource: [id: string] }>();
const labels = { review: "Revisão", source: "Fonte", delivery: "Divulgação" };
</script>
<template>
  <MCard padding="lg" gap="md" class="follow-up-card">
    <MBadge :text="labels[task.kind]" tone="primary" />
    <MText as="h2" variant="title">{{ task.title }}</MText>
    <MText>{{ task.detail }}</MText>
    <MText variant="caption"
      >Responsável na demonstração · {{ task.owner }}</MText
    >
    <RouterLink v-if="task.href" :to="task.href" class="text-link">{{
      task.kind === "review" ? "Abrir revisão" : "Inspecionar canal"
    }}</RouterLink>
    <MButton
      v-if="task.sourceId"
      text="Simular atualização da fonte"
      variant="secondary"
      :disabled="busy"
      @click="$emit('updateSource', task.sourceId)"
    />
  </MCard>
</template>
