<script setup lang="ts">
import {
  MCard,
  MColumn,
  MText,
  MBadge,
  MButton,
  MRow,
} from "@getcortexlabs/mavis-web";
import type { ReviewCase } from "../../cases/domain/case";
import { withdrawalLabels, withdrawalChannels } from "../domain/withdrawal";
defineProps<{
  record: ReviewCase;
  channels: ReturnType<typeof withdrawalChannels>;
  busy: boolean;
}>();
defineEmits<{ retry: [partnerId: string] }>();
const time = (value: string | undefined | null) =>
  value ? new Date(value).toLocaleString("pt-BR") : "Ainda não registrada";
</script>
<template>
  <MColumn gap="lg" class="withdrawal-report">
    <MText as="h2" variant="title">{{ record.name }}</MText>
    <MText
      >Retirada da versão {{ record.revision }} ·
      {{ channels.filter((c) => c.state === "confirmed").length }} de
      {{ channels.length }} canal(is) com confirmação.</MText
    >
    <MText variant="caption"
      >A página e a busca públicas já foram retiradas nesta sessão. Isso não
      confirma a localização da pessoa.</MText
    >
    <MText v-if="!channels.length"
      >Nenhum canal elegível nesta demonstração.</MText
    >
    <div class="withdrawal-channels">
      <MCard
        v-for="channel in channels"
        :key="channel.partner.id"
        padding="lg"
        gap="md"
      >
        <MBadge
          :text="withdrawalLabels[channel.state]"
          :tone="channel.state === 'confirmed' ? 'success' : 'neutral'"
        />
        <MText as="h3" variant="heading">{{ channel.partner.name }}</MText>
        <MText v-if="channel.state === 'confirmed'"
          >Confirmação: {{ time(channel.confirmedAt) }}</MText
        >
        <MText v-else
          >Última tentativa: {{ time(channel.partner.lastAttemptAt) }}</MText
        >
        <MText
          v-if="
            channel.partner.retrySuggestedAt && channel.state !== 'confirmed'
          "
          >Nova tentativa sugerida após
          {{ time(channel.partner.retrySuggestedAt) }}.</MText
        >
        <MText v-if="channel.state === 'expired'" variant="caption"
          >O prazo da cópia terminou, mas o canal ainda precisa confirmar o
          recebimento da retirada.</MText
        >
        <MRow gap="sm" wrap
          ><MButton
            v-if="channel.state !== 'confirmed'"
            text="Tentar retirada novamente"
            :disabled="busy"
            variant="secondary"
            @click="$emit('retry', channel.partner.id)"
          /><RouterLink
            :to="{
              path: '/organization/network',
              query: { partner: channel.partner.id },
            }"
            class="text-link"
            >Inspecionar canal</RouterLink
          ></MRow
        >
      </MCard>
    </div>
  </MColumn>
</template>
<style scoped>
.withdrawal-report {
  padding-block: 28px;
  border-top: 1px solid var(--line);
}
.withdrawal-channels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
@media (max-width: 760px) {
  .withdrawal-channels {
    grid-template-columns: 1fr;
  }
}
</style>
