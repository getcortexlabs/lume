<script setup lang="ts">
import { computed } from "vue";
import {
  MColumn,
  MRow,
  MText,
  MButton,
  MCard,
  MEmptyState,
  MBadge,
} from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import TipWorkspace from "../components/TipWorkspace.vue";
import { tipLabels } from "../domain/tip";
import { useTips } from "../composables/useTips";
const {
  data,
  loading,
  error,
  refresh,
  selected,
  filter,
  caseId,
  busy,
  actionError,
  message,
  visible,
  current,
  receive,
  advance,
} = useTips();
const cases = computed(() =>
  data.value.records.map((c) => ({ value: c.id, label: c.name })),
);
const statuses = [
  { value: "", label: "Todas as etapas" },
  ...Object.entries(tipLabels).map(([value, label]) => ({ value, label })),
];
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">ESCUTA, CONTEXTO E CUIDADO</p>
      <h1>Uma informação merece<br />um caminho responsável.</h1>
      <p>
        Caixa privada de demonstração. Nenhum relato real é recebido, nenhuma
        mensagem é enviada. Os exemplos e suas etapas duram apenas nesta sessão.
      </p>
    </div>
    <MRow gap="md" wrap class="workspace-links"
      ><AppSelect
        id="tip-example-case"
        v-model="caseId"
        label="Aviso para o exemplo fictício"
        :options="cases" /><MButton
        text="Receber relato de exemplo"
        :disabled="busy || !cases.length || !!error"
        @click="receive" /><MButton
        text="Atualizar caixa"
        variant="secondary"
        @click="refresh"
    /></MRow>
    <MText v-if="loading" role="status">Carregando relatos fictícios…</MText
    ><MText v-if="error || actionError" role="alert">{{
      error || actionError
    }}</MText
    ><MText v-if="message" role="status">{{ message }}</MText>
    <div v-if="!error" class="tips-layout">
      <MColumn gap="md"
        ><AppSelect
          id="tip-status"
          v-model="filter"
          label="Etapa do relato"
          :options="statuses" /><MCard
          v-for="(tip, index) in visible"
          :key="tip.id"
          padding="lg"
          gap="md"
          ><MBadge :text="tipLabels[tip.status]" /><MText
            as="h2"
            variant="heading"
            >{{
              data.records.find((c) => c.id === tip.caseId)?.name ??
              "Aviso com divulgação indisponível"
            }}</MText
          ><MText variant="caption">{{ tip.observedAt }}</MText
          ><MButton
            text="Abrir relato"
            :accessibility-label="`Abrir relato ${index + 1}`"
            variant="secondary"
            :aria-pressed="current?.id === tip.id"
            @click="selected = tip.id" /></MCard
        ><MEmptyState
          v-if="!loading && !visible.length"
          title="Nenhum relato neste recorte."
          description="Mude o filtro ou receba um exemplo fictício." /></MColumn
      ><TipWorkspace
        v-if="current"
        :key="`${current.id}-${current.revision}`"
        :tip="current"
        :busy="busy"
        @advance="advance"
      />
    </div>
  </section>
</template>
<style scoped>
.tips-layout {
  display: grid;
  grid-template-columns: minmax(250px, 0.8fr) minmax(0, 1.5fr);
  gap: 32px;
  margin-top: 32px;
}
@media (max-width: 850px) {
  .tips-layout {
    grid-template-columns: 1fr;
  }
}
</style>
