<script setup lang="ts">
import HttpTracePanel from "../components/HttpTracePanel.vue";
import {
  MColumn,
  MText,
  MButton,
  MCheckbox,
  MRow,
} from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { useSimulation } from "../composables/useSimulation";
const { state, latency, message, apply } = useSimulation();
</script>
<template>
  <section class="wrap page-section intake-page">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">LABORATÓRIO DO PROTÓTIPO</p>
      <h1>Ensaiar também<br />é cuidar.</h1>
      <p>
        Simule situações que a integração precisará tratar. Estas opções não
        representam autenticação ou serviços reais.
      </p>
    </div>
    <MColumn gap="lg" class="intake-form">
      <AppSelect
        id="simulation-latency"
        label="Tempo de resposta"
        v-model="latency"
        :options="[
          { value: '0', label: 'Imediato' },
          { value: '1200', label: '1,2 segundo' },
          { value: '3000', label: '3 segundos' },
        ]"
      />
      <AppSelect
        id="simulation-role"
        label="Perfil de demonstração"
        v-model="state.role"
        :options="[
          { value: 'reviewer', label: 'Revisor' },
          { value: 'viewer', label: 'Somente consulta pública' },
        ]"
      />
      <MCheckbox
        label="Simular serviço indisponível"
        v-model="state.unavailable"
      />
      <MCheckbox
        label="Simular conflito na próxima alteração"
        v-model="state.conflictNextWrite"
      />
      <MRow gap="sm" wrap
        ><MButton text="Aplicar cenário" @click="apply()" /><MButton
          text="Restaurar operação normal"
          variant="secondary"
          @click="apply(true)"
      /></MRow>
      <MText v-if="message" role="status">{{ message }}</MText>
      <RouterLink to="/cases" class="text-link"
        >Experimentar busca pública →</RouterLink
      >
      <RouterLink to="/organization" class="text-link"
        >Experimentar revisão →</RouterLink
      >
    </MColumn>
    <HttpTracePanel />
  </section>
</template>
