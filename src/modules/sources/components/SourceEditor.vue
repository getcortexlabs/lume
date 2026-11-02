<script setup lang="ts">
import {
  MColumn,
  MInput,
  MCheckbox,
  MButton,
  MRow,
  MText,
} from "@getcortexlabs/mavis-web";
import type { SourceInput } from "../domain/source";
const input = defineModel<SourceInput>({ required: true });
defineProps<{ busy: boolean; isNew: boolean }>();
defineEmits<{ save: []; cancel: [] }>();
</script>
<template>
  <MColumn gap="md" class="source-editor">
    <MText as="h2" variant="title">{{
      isNew ? "Nova fonte fictícia" : "Editar fonte"
    }}</MText>
    <MInput :disabled="busy" v-model="input.name" label="Nome da fonte" />
    <MInput :disabled="busy" v-model="input.url" label="URL de referência" />
    <MInput
      :disabled="busy"
      v-model="input.owner"
      label="Responsável pela fonte"
    />
    <MInput
      :disabled="busy"
      :model-value="String(input.frequencyHours)"
      label="Intervalo entre consultas (horas)"
      inputmode="numeric"
      @update:model-value="input.frequencyHours = Number($event)"
    />
    <MCheckbox v-model="input.enabled" label="Fonte ativa na demonstração" />
    <MText variant="caption"
      >Endereço apenas de referência. Esta demonstração não acessa nem importa
      páginas externas.</MText
    >
    <MRow gap="sm" wrap
      ><MButton
        text="Salvar fonte"
        :loading="busy"
        @click="$emit('save')" /><MButton
        text="Cancelar edição"
        variant="ghost"
        :disabled="busy"
        @click="$emit('cancel')"
    /></MRow>
  </MColumn>
</template>
