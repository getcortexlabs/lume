<script setup lang="ts">
import { toRef } from "vue";
import {
  MCard,
  MColumn,
  MRow,
  MText,
  MInput,
  MButton,
  MBadge,
} from "@getcortexlabs/mavis-web";
import { normalize, type ReviewCase } from "../../cases/domain/case";
import { fieldLabels } from "../domain/assistance";
import { useReviewAssistance } from "../composables/useReviewAssistance";
const emit = defineEmits<{ highlight: [quote: string] }>();
const props = defineProps<{ record: ReviewCase }>();
const {
  related,
  busy,
  error,
  editing,
  value,
  quote,
  reason,
  suggestions,
  edit,
  resolve,
} = useReviewAssistance(toRef(props, "record"));
</script>
<template>
  <MColumn gap="lg" class="review-assistance">
    <MText as="h3" variant="heading">Conferência assistida</MText>
    <MText variant="caption" tone="muted"
      >Sugestões simuladas, sem chamada de IA. Uma divergência precisa de
      decisão humana antes da publicação.</MText
    >
    <MText v-if="error" role="alert">{{ error }}</MText>
    <MCard
      v-for="suggestion in suggestions"
      :key="suggestion.id"
      padding="md"
      gap="md"
    >
      <MBadge
        :text="
          suggestion.resolution
            ? 'Conferência registrada'
            : suggestion.conflict
              ? 'Fontes divergentes'
              : 'Sugestão com evidência'
        "
        :tone="
          suggestion.conflict && !suggestion.resolution ? 'warning' : 'neutral'
        "
      />
      <MText
        >{{ fieldLabels[suggestion.field] }}: {{ record[suggestion.field] }} →
        sugestão: {{ suggestion.value }}</MText
      >
      <blockquote>“{{ suggestion.quote }}”</blockquote>
      <MButton
        text="Destacar na fonte"
        variant="ghost"
        :disabled="!record.evidence.includes(suggestion.quote)"
        @click="emit('highlight', suggestion.quote)"
      />
      <template v-if="record.status === 'in_review' && !suggestion.resolution">
        <MRow gap="sm" wrap
          ><MButton
            text="Aceitar sugestão"
            :loading="busy"
            @click="resolve(suggestion, true)" /><MButton
            text="Corrigir com evidência"
            variant="secondary"
            @click="edit(suggestion)"
        /></MRow>
        <MColumn v-if="editing === suggestion.id" gap="md">
          <MInput label="Valor corrigido" v-model="value" />
          <MInput label="Trecho exato da fonte" v-model="quote" />
          <MInput label="Motivo da correção" v-model="reason" />
          <MButton
            text="Registrar correção"
            :loading="busy"
            @click="resolve(suggestion, false)"
          />
        </MColumn>
      </template>
    </MCard>
    <MText v-if="!suggestions.length" variant="caption"
      >Este cadastro será conferido manualmente. Nenhum campo foi extraído
      automaticamente.</MText
    >
    <MText as="h3" variant="heading">Possíveis registros relacionados</MText>
    <MText variant="caption" tone="muted"
      >Comparação por nome ou município, idade e período próximos. Isso não
      confirma a mesma pessoa ou episódio; nenhum registro é unido
      automaticamente.</MText
    >
    <MCard
      v-for="candidate in related"
      :key="candidate.id"
      padding="md"
      gap="sm"
    >
      <MText
        >{{ candidate.name }} · {{ candidate.age }} anos ·
        {{ candidate.city }}</MText
      >
      <MText variant="caption"
        >Data informada: {{ candidate.missingSince }} ·
        {{
          normalize(candidate.name) === normalize(record.name)
            ? "Mesmo nome informado"
            : "Município, idade e período próximos; nomes diferentes"
        }}</MText
      >
      <RouterLink
        :to="{ path: '/organization', query: { case: candidate.id } }"
        class="text-link"
        >Abrir registro para comparação</RouterLink
      >
    </MCard>
    <MText v-if="!related.length" variant="caption"
      >Nenhum candidato pelos critérios desta demonstração.</MText
    >
  </MColumn>
</template>
