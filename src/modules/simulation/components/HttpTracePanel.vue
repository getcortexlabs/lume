<script setup lang="ts">
import { ref, onScopeDispose } from "vue";
import { MColumn, MText, MCard, MBadge } from "@getcortexlabs/mavis-web";
import { useServices } from "../../../app/services";
const { http } = useServices();
const traces = ref(http.list());
onScopeDispose(
  http.subscribe(() => {
    traces.value = http.list();
  }),
);
</script>
<template>
  <MColumn gap="md" class="http-trace-panel">
    <MText as="h2" variant="title">Contrato em movimento</MText>
    <MText
      >Solicitações HTTP simuladas dentro da aplicação. Nenhum servidor externo
      é chamado; este painel mostra método, rota e resposta, sem conteúdo de
      relatos ou rascunhos.</MText
    >
    <MText v-if="!traces.length"
      >Percorra uma jornada e volte para inspecionar as respostas.</MText
    >
    <MCard v-for="(trace, index) in traces" :key="index" padding="md" gap="sm"
      ><MBadge
        :text="String(trace.status)"
        :tone="trace.status < 400 ? 'success' : 'neutral'"
      /><MText>{{ trace.method }} {{ trace.path }}</MText
      ><MText variant="caption"
        >{{ trace.durationMs }} ms · transporte local simulado</MText
      ></MCard
    >
  </MColumn>
</template>
<style scoped>
.http-trace-panel {
  max-width: 760px;
  margin: 48px auto;
  overflow-wrap: anywhere;
}
</style>
