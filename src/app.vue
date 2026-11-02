<script setup lang="ts">
import { useContentTransition } from "./shared/motion/useContentTransition";
const pageTransition = useContentTransition();
import { useHead, useRoute } from "#app";
import { MColumn, MScreen } from "@getcortexlabs/mavis-web";
import AppHeader from "./shared/components/AppHeader.vue";
import AppFooter from "./shared/components/AppFooter.vue";
import WorkspaceContext from "./modules/workspaces/components/WorkspaceContext.vue";
import { useWorkspace } from "./modules/workspaces/composables/useWorkspace";
const { state: workspaceState } = useWorkspace();
import { useMavisTokens } from "@getcortexlabs/mavis-web";
const themeVariables = useMavisTokens();
const route = useRoute();
useHead(() => ({
  title: `${String(route.meta.title ?? "Cada pessoa importa")} — Lume`,
}));
</script>
<template>
  <MColumn class="app-shell" :style="themeVariables">
    <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
    <AppHeader v-if="!route.meta.standalone" />
    <WorkspaceContext
      v-if="route.path.startsWith('/organization')"
      class="wrap"
    />
    <MScreen
      id="main-content"
      class="lume-screen"
      :style="{ minHeight: '60vh', fontFamily: 'inherit' }"
    >
      <NuxtPage
        :page-key="(route) => `${workspaceState.revision}:${route.path}`"
        :transition="pageTransition"
      />
    </MScreen>
    <AppFooter v-if="!route.meta.standalone" />
  </MColumn>
</template>
