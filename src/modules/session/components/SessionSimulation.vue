<script setup lang="ts">
import { MButton, MCard, MRow, MText } from "@getcortexlabs/mavis-web";
import { useSessionActions } from "../composables/useSessionActions";
const { leave } = useSessionActions();
</script>
<template>
  <MCard padding="lg" gap="md" class="session-simulation">
    <MText as="h2" variant="heading">Sessão e acesso</MText>
    <MText as="p"
      >Experimente as telas de recuperação. A simulação guarda apenas o estado
      da sessão nesta aba; não usa credenciais reais.</MText
    >
    <MRow wrap gap="sm"
      ><MButton
        text="Simular sessão expirada"
        variant="secondary"
        @click="leave('expired')" /><MButton
        text="Simular acesso negado"
        variant="secondary"
        @click="leave('denied')"
    /></MRow>
  </MCard>
</template>
<style scoped>
.session-simulation {
  margin-block: 32px;
}
</style>
