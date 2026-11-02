<script setup lang="ts">
import { useClientReady } from "../../../shared/composables/useClientReady";
const clientReady = useClientReady();
import { MButton, MColumn, MText, MRow } from "@getcortexlabs/mavis-web";
import CasePoster from "../components/CasePoster.vue";
import { useCasePoster } from "../composables/useCasePoster";
import { useClipboard } from "../../../shared/composables/useClipboard";
const {
  data: record,
  state,
  error,
  loading,
  refresh,
  url,
  printing,
  print,
} = useCasePoster();
const { copy, message } = useClipboard();
</script>
<template>
  <section class="wrap page-section poster-page">
    <div class="poster-controls">
      <RouterLink to="/cases" class="back-link">← Voltar aos avisos</RouterLink>
      <MColumn gap="md"
        ><MText as="h2" variant="title"
          >Uma informação que pode circular com cuidado.</MText
        ><MText
          >Cartaz fictício para impressão ou PDF. O QR code abre a página atual
          da demonstração.</MText
        >
        <MRow v-if="record && !error" gap="sm" wrap
          ><MButton
            :disabled="!clientReady"
            text="Imprimir ou salvar PDF"
            icon="printer"
            :loading="printing"
            @click="print" /><MButton
            :disabled="!clientReady"
            text="Copiar link do aviso"
            variant="secondary"
            @click="copy(url, 'Link do aviso copiado.')"
        /></MRow>
        <MText v-if="message" role="status">{{ message }}</MText>
      </MColumn>
    </div>
    <MText v-if="loading" role="status">Conferindo a versão pública…</MText>
    <div v-if="error" role="alert">
      {{ error }}<MButton text="Tentar novamente" @click="refresh" />
    </div>
    <CasePoster v-else-if="record" :record="record" :url="url" />
    <MText v-else-if="!loading" as="h1" variant="title">{{
      state === "withdrawn"
        ? "A divulgação deste aviso foi retirada."
        : "Este cartaz não está disponível."
    }}</MText>
  </section>
</template>
