<script setup lang="ts">
import { MInput, MCheckbox, MColumn, MText } from "@getcortexlabs/mavis-web";
import AppDateInput from "../../../shared/ui/AppDateInput.vue";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { cityOptions } from "../../cases/presentation/choices";
import type { DraftInput } from "../domain/draft";
defineProps<{ step: number }>();
const input = defineModel<DraftInput>({ required: true });
</script>
<template>
  <MColumn gap="lg">
    <template v-if="step === 0">
      <MInput label="Nome fictício" v-model="input.name" />
      <MInput label="Idade" inputmode="numeric" v-model="input.age" />
      <AppSelect
        id="intake-city"
        label="Cidade do piloto"
        v-model="input.city"
        :options="cityOptions.filter((option) => option.value)"
      />
      <MInput label="Região para divulgação" v-model="input.neighborhood" />
    </template>
    <template v-else-if="step === 1">
      <AppDateInput
        id="intake-date"
        preserve-draft
        label="Data do desaparecimento"
        v-model="input.missingSince"
      />
      <MInput
        label="Informações públicas do aviso"
        v-model="input.description"
        multiline
        :rows="4"
      />
      <MInput
        label="Vestuário informado"
        v-model="input.clothing"
        multiline
        :rows="2"
      />
    </template>
    <template v-else>
      <MInput label="Origem da informação" v-model="input.source" />
      <MInput
        label="Registro reservado para revisão"
        v-model="input.evidence"
        multiline
        :rows="6"
      />
      <MText variant="caption" tone="muted"
        >O registro reservado fica na organização. Nome, idade, região, datas,
        descrição, vestuário e nome da fonte compõem a prévia pública.</MText
      >
      <MCheckbox
        label="Confirmo a autorização simulada desses campos públicos."
        v-model="input.authorized"
      />
    </template>
  </MColumn>
</template>
