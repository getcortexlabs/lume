<script setup lang="ts">
import { MCard, MText, MBadge, MColumn } from "@getcortexlabs/mavis-web";
import type { DraftInput } from "../domain/draft";
import { formatDate } from "../../cases/domain/case";
defineProps<{ input: DraftInput }>();
</script>
<template>
  <MCard padding="lg" gap="lg" class="draft-preview">
    <MBadge text="Prévia fictícia · ainda não publicada" />
    <MText as="h2" variant="title">{{ input.name }}</MText>
    <MText
      >{{ input.age }} anos · {{ input.neighborhood }}, {{ input.city }}</MText
    >
    <MColumn gap="sm"
      ><MText variant="caption" tone="muted">Desaparecimento informado</MText
      ><MText>{{ formatDate(input.missingSince) }}</MText></MColumn
    >
    <MText>{{ input.description }}</MText
    ><MText>{{ input.clothing }}</MText>
    <MText variant="caption">Origem: {{ input.source }}</MText>
    <MText variant="caption" tone="muted"
      >A data e a versão da revisão serão atribuídas na aprovação. O registro
      reservado não é divulgado.</MText
    >
  </MCard>
</template>
