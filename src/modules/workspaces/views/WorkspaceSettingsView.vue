<script setup lang="ts">
import { ref } from "vue";
import {
  MColumn,
  MText,
  MButton,
  MCard,
  MBadge,
} from "@getcortexlabs/mavis-web";
import { useWorkspace } from "../composables/useWorkspace";
const { state, organizations, workspace } = useWorkspace();
const error = ref("");
function select(id: string) {
  try {
    workspace.switchTo(id);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Não foi possível trocar.";
  }
}
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">CADA EQUIPE, SEU CUIDADO</p>
      <h1>Um espaço próprio<br />para cada organização.</h1>
      <p>
        Casos, fontes, relatos, notificações e rascunhos separados na
        demonstração. Esta seleção vale nesta aba; ao recarregar, o contexto
        volta à Horizonte. Permissões reais dependerão do servidor.
      </p>
    </div>
    <MText v-if="error" role="alert">{{ error }}</MText
    ><MColumn gap="lg"
      ><MCard
        v-for="organization in organizations"
        :key="organization.id"
        padding="lg"
        gap="md"
        ><MText as="h2" variant="title">{{ organization.name }}</MText
        ><MBadge
          :text="
            state.organization.id === organization.id
              ? 'Contexto atual'
              : 'Ambiente independente'
          " /><MButton
          :text="`Usar ${organization.name}`"
          :disabled="state.organization.id === organization.id"
          @click="select(organization.id)" /></MCard
    ></MColumn>
  </section>
</template>
