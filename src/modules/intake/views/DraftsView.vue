<script setup lang="ts">
import {
  MCard,
  MColumn,
  MText,
  MButton,
  MEmptyState,
} from "@getcortexlabs/mavis-web";
import AppDialog from "../../../shared/components/AppDialog.vue";
import { useDrafts } from "../composables/useDrafts";
const {
  data,
  error,
  loading,
  refresh,
  selected,
  busy,
  actionError,
  message,
  run,
} = useDrafts();
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <h1>Um começo guardado.</h1>
      <p>Retome os rascunhos salvos neste navegador.</p>
    </div>
    <RouterLink to="/organization/cases/new" class="button-link"
      >Cadastrar aviso fictício</RouterLink
    >
    <MText v-if="loading" role="status">Carregando rascunhos…</MText>
    <div v-if="error" role="alert">
      {{ error }}<MButton text="Tentar novamente" @click="refresh" />
    </div>
    <MText v-if="actionError" role="alert">{{ actionError }}</MText>
    <MText v-if="message" role="status">{{ message }}</MText>
    <MEmptyState
      v-if="!error && !loading && !data.length"
      title="Nenhum rascunho salvo."
      description="Comece um cadastro e salve para continuar depois, mesmo após recarregar a página."
    />
    <MColumn gap="lg" class="workspace-links"
      ><MCard v-for="draft in data" :key="draft.id" padding="lg" gap="md"
        ><MText as="h2" variant="title">{{
          draft.input.name || "Cadastro sem nome"
        }}</MText
        ><MText
          >{{ draft.input.city || "Cidade não informada" }} · versão
          {{ draft.revision }}</MText
        ><RouterLink :to="`/organization/drafts/${draft.id}`" class="text-link"
          >Retomar cadastro</RouterLink
        >
        <MButton
          text="Duplicar rascunho"
          variant="secondary"
          :disabled="busy"
          @click="run('duplicate', draft)"
        />
        <MButton
          text="Excluir rascunho"
          variant="ghost"
          :disabled="busy"
          @click="selected = draft"
        /> </MCard
    ></MColumn>
    <AppDialog
      :open="!!selected"
      title="Excluir este rascunho?"
      @close="selected = null"
      ><MText
        >O rascunho será removido deste navegador. Uma publicação já enviada
        para revisão não é alterada.</MText
      ><MButton
        text="Confirmar exclusão"
        :loading="busy"
        @click="selected && run('delete', selected)"
      /><MText v-if="actionError" role="alert">{{
        actionError
      }}</MText></AppDialog
    >
  </section>
</template>
