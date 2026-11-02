<script setup lang="ts">
import { computed, ref } from "vue";
import { MColumn, MText, MRow, MButton, MCard } from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import {
  conflictRows,
  type DraftConflict,
  type ConflictChoices,
  type DraftField,
} from "../domain/draft-conflict";
const props = defineProps<{ conflict: DraftConflict; busy: boolean }>();
defineEmits<{ merge: [choices: ConflictChoices]; remote: []; copy: [] }>();
const choices = ref<ConflictChoices>({});
const rows = computed(() => conflictRows(props.conflict));
const display = (value: string | boolean) =>
  typeof value === "boolean"
    ? value
      ? "Confirmada"
      : "Não confirmada"
    : value || "Não informado";
function choose(key: DraftField, value: string) {
  if (value === "local" || value === "remote") choices.value[key] = value;
  else delete choices.value[key];
}
</script>
<template>
  <MColumn
    gap="lg"
    class="draft-conflict"
    role="region"
    aria-label="Resolver conflito do rascunho"
  >
    <MText as="h2" variant="title">{{
      conflict.remote
        ? "Este rascunho mudou em outra aba."
        : "Este rascunho foi removido em outra aba."
    }}</MText>
    <MText
      >Suas edições estão preservadas aqui. O salvamento automático fica pausado
      até você decidir como continuar.</MText
    >
    <MCard v-for="row in rows" :key="row.key" padding="md" gap="sm"
      ><MText as="h3" variant="heading">{{ row.label }}</MText
      ><MText>Minha edição: {{ display(row.local) }}</MText
      ><MText>Versão salva: {{ display(row.remote) }}</MText>
      <AppSelect
        v-if="row.needsChoice"
        :id="`conflict-${row.key}`"
        :label="`Manter versão de ${row.label}`"
        :model-value="choices[row.key] ?? ''"
        :options="[
          { value: '', label: 'Escolha uma versão' },
          { value: 'local', label: 'Minha edição' },
          { value: 'remote', label: 'Versão salva' },
        ]"
        @update:model-value="choose(row.key, $event)"
      />
      <MText v-else variant="caption"
        >A edição feita em apenas uma das abas será mantida na
        combinação.</MText
      >
    </MCard>
    <MRow gap="sm" wrap
      ><MButton
        v-if="conflict.remote"
        text="Combinar e salvar"
        :disabled="
          busy || rows.some((row) => row.needsChoice && !choices[row.key])
        "
        @click="$emit('merge', choices)" /><MButton
        v-if="conflict.remote"
        text="Usar somente a versão salva"
        variant="secondary"
        :disabled="busy"
        @click="$emit('remote')" /><MButton
        text="Salvar minhas edições em uma cópia"
        variant="ghost"
        :disabled="busy"
        @click="$emit('copy')"
    /></MRow>
  </MColumn>
</template>
