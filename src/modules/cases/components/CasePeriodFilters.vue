<script setup lang="ts">
import { MText } from "@getcortexlabs/mavis-web";
import AppDateInput from "../../../shared/ui/AppDateInput.vue";
import AppSelect from "../../../shared/ui/AppSelect.vue";
const dateField = defineModel<string>("dateField", { required: true });
const from = defineModel<string>("from", { required: true });
const to = defineModel<string>("to", { required: true });
</script>
<template>
  <div class="period-filters">
    <AppSelect
      id="filter-date-field"
      label="Filtrar período de"
      v-model="dateField"
      :options="[
        { value: 'missing', label: 'Desaparecimento informado' },
        { value: 'reviewed', label: 'Revisão da divulgação' },
      ]"
    />
    <AppDateInput id="filter-from" label="A partir de" v-model="from" />
    <AppDateInput id="filter-to" label="Até" v-model="to" />
    <MText v-if="from && to && from > to" role="alert"
      >A data final deve ser igual ou posterior à inicial.</MText
    >
    <MText v-else variant="caption" tone="muted"
      >O período se refere à data selecionada, não à criação do aviso.</MText
    >
  </div>
</template>
