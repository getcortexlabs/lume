<script setup lang="ts">
import { MColumn, MText, MStack } from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { orderOptions } from "../presentation/search-state";
defineProps<{ count: number; loading: boolean; city: string }>();
const order = defineModel<string>({ required: true });
</script>
<template>
  <MStack
    class="case-results-toolbar"
    gap="lg"
    direction="row"
    wrap
    align="center"
    justify="between"
  >
    <MColumn gap="xs" class="case-results-summary">
      <MText as="p" variant="heading" aria-live="polite" aria-atomic="true">{{
        loading
          ? "Buscando avisos…"
          : `${count} ${count === 1 ? "aviso disponível" : "avisos disponíveis"}`
      }}</MText>
      <MText as="p" variant="caption" tone="muted"
        >{{ city || "Todas as cidades" }} · Exemplos fictícios</MText
      >
    </MColumn>
    <AppSelect
      id="case-order"
      label="Ordenar avisos"
      v-model="order"
      :options="orderOptions"
    />
  </MStack>
</template>

<style scoped>
.case-results-summary {
  flex: 1 1 280px;
}
.case-results-toolbar > .lume-select {
  flex: 1 1 260px;
}
</style>
