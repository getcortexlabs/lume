<script setup lang="ts">
import {
  MColumn,
  MRow,
  MText,
  MButton,
  MCard,
  MEmptyState,
} from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import FollowUpCard from "../components/FollowUpCard.vue";
import { useFollowUp } from "../composables/useFollowUp";
const {
  data,
  loading,
  error,
  refresh,
  filter,
  visible,
  busy,
  actionError,
  message,
  updateSource,
} = useFollowUp();
const options = [
  { value: "all", label: "Todas as pendências" },
  { value: "review", label: "Revisões" },
  { value: "source", label: "Fontes" },
  { value: "delivery", label: "Divulgação" },
];
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">CUIDADO QUE CONTINUA</p>
      <h1>O próximo cuidado<br />tem um lugar aqui.</h1>
      <p>
        Revisões, fontes e canais que precisam de atenção. Prazos e responsáveis
        simulados para experimentar a operação.
      </p>
    </div>
    <MRow gap="md" wrap class="workspace-links"
      ><AppSelect
        id="task-filter"
        v-model="filter"
        label="Mostrar pendências"
        :options="options" /><MButton
        text="Atualizar acompanhamento"
        variant="secondary"
        @click="refresh"
    /></MRow>
    <MText v-if="loading" role="status">Conferindo pendências…</MText>
    <MText v-if="error || actionError" role="alert">{{
      error || actionError
    }}</MText>
    <MText v-if="message" role="status">{{ message }}</MText>
    <template v-if="!error">
      <MText class="follow-up-count"
        >{{ visible.length }} pendência(s) neste recorte</MText
      >
      <div class="follow-up-grid">
        <FollowUpCard
          v-for="task in visible"
          :key="task.id"
          :task="task"
          :busy="busy"
          @update-source="updateSource"
        />
      </div>
      <MEmptyState
        v-if="!loading && !visible.length"
        title="Este recorte está em dia."
        description="As pendências desaparecem quando a ação correspondente é concluída na demonstração."
      />
      <MColumn gap="md" class="source-health"
        ><MText as="h2" variant="title">Quando a fonte foi consultada?</MText
        ><MText
          >Consultar uma fonte e receber uma atualização são eventos
          diferentes.</MText
        >
        <MCard
          v-for="source in data.sources"
          :key="source.id"
          padding="lg"
          gap="sm"
          ><MText as="h3" variant="heading">{{ source.name }}</MText
          ><MText
            >Última tentativa:
            {{
              source.checkedAt
                ? new Date(source.checkedAt).toLocaleString("pt-BR")
                : "Ainda não realizada"
            }}
            ·
            {{
              source.state === "available" ? "consulta concluída" : "falhou"
            }}</MText
          ><MText
            >Atualização informada pela fonte:
            {{
              source.updatedAt
                ? new Date(source.updatedAt).toLocaleString("pt-BR")
                : "Ainda não informada"
            }}</MText
          ></MCard
        >
      </MColumn>
    </template>
  </section>
</template>
<style scoped>
.follow-up-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 24px 0;
}
.follow-up-count {
  margin-top: 20px;
}
.source-health {
  margin-top: 48px;
}
@media (max-width: 760px) {
  .follow-up-grid {
    grid-template-columns: 1fr;
  }
}
</style>
