<script setup lang="ts">
import { clearError, useHead, type NuxtError } from "#app";
import {
  MButton,
  MCard,
  MColumn,
  MRow,
  MScreen,
  MText,
} from "@getcortexlabs/mavis-web";
import BrandSymbol from "./shared/components/BrandSymbol.vue";
const props = defineProps<{ error: NuxtError }>();
useHead({
  title: "Não foi possível abrir a página — Lume",
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});
function retry() {
  window.location.reload();
}
</script>
<template>
  <MScreen :style="{ minHeight: '100vh', backgroundColor: '#f3f1e9' }">
    <main class="error-page">
      <MCard padding="lg" gap="lg">
        <BrandSymbol :size="52" />
        <MText as="p" variant="caption" tone="muted"
          >LUME · {{ props.error.statusCode === 404 ? "404" : "ERRO" }}</MText
        >
        <MText as="h1" variant="title">{{
          props.error.statusCode === 404
            ? "Esse caminho não está disponível."
            : "Não foi possível abrir esta página."
        }}</MText>
        <MColumn gap="sm">
          <MText as="p"
            >Tente novamente ou volte ao início para continuar.</MText
          >
          <MText as="p" tone="muted"
            >Rascunhos já salvos neste navegador continuam disponíveis.</MText
          >
        </MColumn>
        <MRow wrap gap="md">
          <MButton text="Tentar novamente" @click="retry" />
          <MButton
            text="Voltar ao início"
            href="/"
            variant="secondary"
            :navigate="() => clearError({ redirect: '/' })"
          />
        </MRow>
      </MCard>
    </main>
  </MScreen>
</template>
<style scoped>
.error-page {
  width: min(640px, calc(100% - 40px));
  margin: auto;
  padding-block: max(40px, 12vh);
}
</style>
