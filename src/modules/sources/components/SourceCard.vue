<script setup lang="ts">
import { MReveal } from "@getcortexlabs/mavis-web";
import { ref } from "vue";
import {
  MCard,
  MText,
  MBadge,
  MRow,
  MButton,
  MColumn,
} from "@getcortexlabs/mavis-web";
import type { ManagedSource } from "../domain/source";
defineProps<{ source: ManagedSource; busy: boolean }>();
defineEmits<{ edit: []; check: []; recover: [] }>();
const expanded = ref(false);
const date = (value: string | null) =>
  value ? new Date(value).toLocaleString("pt-BR") : "Ainda não registrada";
const labels = {
  imported: "Importado",
  duplicate: "Repetido",
  conflict: "Divergência",
};
</script>
<template>
  <MCard padding="lg" gap="md" class="source-card-managed">
    <MBadge
      :text="
        !source.enabled
          ? 'Pausada'
          : source.state === 'available'
            ? 'Disponível'
            : 'Consulta falhou'
      "
    />
    <MText as="h2" variant="title">{{ source.name }}</MText>
    <MText
      >{{ source.owner }} · a cada {{ source.frequencyHours }} hora(s)</MText
    >
    <MText variant="caption">Referência: {{ source.url }}</MText>
    <MText variant="caption"
      >Última tentativa: {{ date(source.checkedAt) }}</MText
    >
    <MText variant="caption"
      >Última consulta concluída: {{ date(source.lastSuccessAt) }}</MText
    >
    <MText variant="caption"
      >Atualização informada pela fonte: {{ date(source.updatedAt) }}</MText
    >
    <MText v-if="source.lastError">{{ source.lastError }}</MText>
    <MRow gap="sm" wrap
      ><MButton
        text="Editar fonte"
        variant="secondary"
        :disabled="busy"
        @click="$emit('edit')" /><MButton
        text="Simular consulta"
        variant="ghost"
        :disabled="busy || !source.enabled"
        @click="$emit('check')" /><MButton
        v-if="source.state === 'unavailable'"
        text="Simular recuperação"
        variant="ghost"
        :disabled="busy || !source.enabled"
        @click="$emit('recover')"
    /></MRow>
    <MButton
      :text="`Inspecionar registros (${source.imports.length})`"
      variant="ghost"
      :aria-expanded="expanded"
      :aria-controls="`imports-${source.id}`"
      @click="expanded = !expanded"
    />
    <MReveal :id="`imports-${source.id}`" :show="expanded"
      ><MColumn gap="md">
        <MText v-if="!source.imports.length"
          >Nenhum registro importado nesta fonte fictícia.</MText
        >
        <MCard
          v-for="record in source.imports"
          :key="record.externalId"
          padding="md"
          gap="sm"
          ><MBadge :text="labels[record.result]" /><MText
            >{{ record.externalId }} · {{ record.summary }}</MText
          ><MText variant="caption"
            >Recebido em {{ date(record.receivedAt) }}</MText
          ><RouterLink
            class="text-link"
            :to="{ path: '/organization', query: { case: record.caseId } }"
            >Inspecionar na revisão</RouterLink
          ></MCard
        >
      </MColumn></MReveal
    >
  </MCard>
</template>
