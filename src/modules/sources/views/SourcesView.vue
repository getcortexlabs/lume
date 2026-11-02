<script setup lang="ts">
import { MButton, MText, MRow, MEmptyState } from "@getcortexlabs/mavis-web";
import { useSources } from "../composables/useSources";
import SourceCard from "../components/SourceCard.vue";
import SourceEditor from "../components/SourceEditor.vue";
const {
  data,
  loading,
  error,
  refresh,
  editing,
  selected,
  input,
  busy,
  actionError,
  message,
  edit,
  run,
} = useSources();
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">ORIGEM E RESPONSABILIDADE</p>
      <h1>Confiança começa<br />na origem.</h1>
      <p>
        Fontes fictícias, consultas simuladas e um responsável por acompanhar
        cada informação.
      </p>
    </div>
    <MRow gap="sm" wrap class="workspace-links"
      ><MButton text="Cadastrar fonte" @click="edit(null)" /><MButton
        text="Atualizar fontes"
        variant="secondary"
        @click="refresh"
    /></MRow>
    <MText v-if="loading" role="status">Carregando fontes…</MText>
    <MText v-if="error || actionError" role="alert">{{
      error || actionError
    }}</MText>
    <MText v-if="message" role="status">{{ message }}</MText>
    <SourceEditor
      v-if="editing"
      v-model="input"
      :busy="busy"
      :is-new="!selected"
      @save="run('save')"
      @cancel="editing = false"
    />
    <div v-if="!error" class="sources-grid">
      <SourceCard
        v-for="source in data"
        :key="source.id"
        :source="source"
        :busy="busy"
        @edit="edit(source)"
        @check="run('check', source)"
        @recover="run('recover', source)"
      />
    </div>
    <MEmptyState
      v-if="!loading && !error && !data.length"
      title="Nenhuma fonte cadastrada."
      description="Comece com uma origem fictícia e defina quem irá acompanhá-la."
    />
  </section>
</template>
<style scoped>
.sources-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 32px;
}
.source-editor {
  max-width: 720px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 16px;
  margin-block: 24px;
}
.source-card-managed {
  min-width: 0;
  overflow-wrap: anywhere;
}
@media (max-width: 900px) {
  .sources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
