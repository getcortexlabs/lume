<script setup lang="ts">
import {
  MCard,
  MProgress,
  MColumn,
  MRow,
  MText,
  MButton,
  MBadge,
  MCheckbox,
} from "@getcortexlabs/mavis-web";
import AppDialog from "../../../shared/components/AppDialog.vue";
import { useGuide } from "../composables/useGuide";
const {
  data,
  caseId,
  steps,
  completed,
  busy,
  error,
  actionError,
  receive,
  reset,
  resetOpen,
  clearDrafts,
} = useGuide();
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">UM CICLO COMPLETO DE CUIDADO</p>
      <h1>Da primeira informação<br />ao último aviso.</h1>
      <p>
        Conheça o Lume com um caso fictício. Cada etapa acompanha as ações
        feitas nesta organização, nesta aba.
      </p>
    </div>
    <MText v-if="error || actionError" role="alert">{{
      error || actionError
    }}</MText
    ><template v-if="!error"
      ><MRow gap="lg" wrap
        ><MBadge :text="`${completed} de 5 etapas concluídas`" /><MText
          v-if="data.record"
          >Caso de demonstração: {{ data.record.name }}</MText
        ></MRow
      >
      <MProgress
        class="guide-progress"
        :value="completed"
        :max="5"
        label="Progresso da demonstração"
        tone="primary"
      />
      <MColumn gap="lg"
        ><MCard
          v-for="(step, index) in steps"
          :key="step.title"
          padding="lg"
          gap="md"
          ><MRow gap="md" wrap
            ><span class="guide-number">{{
              String(index + 1).padStart(2, "0")
            }}</span
            ><MBadge
              :text="step.done ? 'Concluída' : 'Para experimentar'" /></MRow
          ><MText as="h2" variant="title">{{ step.title }}</MText
          ><MText>{{ step.detail }}</MText
          ><MRow gap="md" wrap
            ><RouterLink
              v-if="index === 0"
              to="/organization/sources"
              class="text-link"
              >Conhecer as fontes</RouterLink
            ><RouterLink
              v-if="index === 1 || index === 2 || index === 4"
              :to="{ path: '/organization', query: { case: caseId } }"
              class="text-link"
              >{{
                index === 4
                  ? "Abrir revisão para retirar"
                  : "Abrir revisão do exemplo"
              }}</RouterLink
            ><template v-if="index === 3"
              ><MButton
                text="Gerar relato fictício"
                :disabled="data.record?.status !== 'published' || step.done"
                :loading="busy"
                @click="receive"
              /><RouterLink to="/organization/tips" class="text-link"
                >Acompanhar relatos</RouterLink
              ><MText
                v-if="data.record?.status !== 'published' && !step.done"
                variant="caption"
                >Publique o exemplo para habilitar esta etapa.</MText
              ></template
            ><RouterLink
              v-if="index === 4"
              to="/organization/withdrawals"
              class="text-link"
              >Conferir retirada nos canais</RouterLink
            ></MRow
          ></MCard
        ></MColumn
      ></template
    ><MCard padding="lg" gap="md" class="guide-reset"
      ><MText as="h2" variant="heading">Experimentar outra vez</MText
      ><MText
        >Restaure os exemplos apenas desta organização. As outras organizações
        continuam como estão.</MText
      ><MButton
        text="Reiniciar demonstração"
        variant="secondary"
        @click="resetOpen = true" /></MCard
    ><AppDialog
      :open="resetOpen"
      title="Reiniciar esta organização?"
      @close="resetOpen = false"
      ><MText
        >Casos, fontes, relatos, canais, notificações e permissões simuladas
        voltarão ao início. Os rascunhos serão preservados, a menos que você
        marque a opção abaixo.</MText
      ><MCheckbox
        v-model="clearDrafts"
        label="Também excluir os rascunhos desta organização neste navegador" /><MRow
        gap="md"
        wrap
        ><MButton text="Confirmar reinício" @click="reset" /><MButton
          text="Cancelar"
          variant="ghost"
          @click="resetOpen = false" /></MRow
    ></AppDialog>
  </section>
</template>
<style scoped>
.guide-progress {
  margin: 24px 0 32px;
}
.guide-number {
  font-family: Georgia, serif;
  font-size: 32px;
  color: #52633f;
}
.guide-reset {
  margin-top: 40px;
}
</style>
