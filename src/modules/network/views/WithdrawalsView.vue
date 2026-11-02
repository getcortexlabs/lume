<script setup lang="ts">
import OperationFeedback from "../../../shared/ui/OperationFeedback.vue";
import { MText, MButton, MEmptyState } from "@getcortexlabs/mavis-web";
import { useWithdrawals } from "../composables/useWithdrawals";
import WithdrawalReport from "../components/WithdrawalReport.vue";
const { reports, loading, error, refresh, busy, actionError, message, retry } =
  useWithdrawals();
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">CUIDADO TAMBÉM É RETIRAR</p>
      <h1>A informação precisa<br />saber quando parar.</h1>
      <p>
        Acompanhe a retirada em cada canal fictício. As tentativas são manuais
        nesta demonstração; impressos e capturas de tela não podem ser
        recolhidos por aqui.
      </p>
    </div>
    <MButton text="Atualizar retiradas" variant="secondary" @click="refresh" />
    <MText v-if="loading" role="status">Conferindo confirmações…</MText
    ><OperationFeedback :error="error || actionError" :message="message" />
    <template v-if="!error"
      ><WithdrawalReport
        v-for="report in reports"
        :key="report.record.id"
        :record="report.record"
        :channels="report.channels"
        :busy="busy"
        @retry="retry" /><MEmptyState
        v-if="!loading && !reports.length"
        title="Nenhuma retirada nesta sessão."
        description="Retire uma publicação na revisão para acompanhar as confirmações dos canais."
    /></template>
  </section>
</template>
