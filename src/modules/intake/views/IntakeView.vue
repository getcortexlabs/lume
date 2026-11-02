<script setup lang="ts">
import OperationFeedback from "../../../shared/ui/OperationFeedback.vue";
import {
  MRow,
  MText,
  MButton,
  MSteps,
  MFormGroup,
} from "@getcortexlabs/mavis-web";
import DraftConflictPanel from "../components/DraftConflictPanel.vue";
import IntakeFields from "../components/IntakeFields.vue";
import DraftPreview from "../components/DraftPreview.vue";
import { useCaseIntake } from "../composables/useCaseIntake";
const {
  input,
  step,
  busy,
  ready,
  error,
  message,
  issues,
  next,
  save,
  saveStatus,
  conflict,
  resolveConflict,
} = useCaseIntake();
const steps = [
  "Pessoa",
  "Desaparecimento",
  "Origem e autorização",
  "Prévia pública",
];
</script>
<template>
  <section class="wrap page-section intake-page">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">CUIDADO EM CADA ETAPA</p>
      <h1>Uma informação começa<br />com atenção.</h1>
      <p>
        Use apenas dados fictícios. Os rascunhos ficam salvos neste navegador,
        inclusive depois de fechar a página.
      </p>
    </div>
    <MSteps
      class="intake-steps"
      label="Etapas do cadastro"
      :model-value="step"
      :loading="busy"
      :disabled="!ready || !!conflict"
      current-label="Etapa atual"
      complete-label="Concluída"
      error-label="Precisa de atenção"
      :steps="
        steps.map((label, index) => ({
          value: index,
          label,
          disabled: index > step,
          status: index < step ? 'complete' : 'pending',
        }))
      "
      @update:model-value="
        (value) => {
          if (typeof value === 'number' && value <= step) step = value;
        }
      "
    />
    <MFormGroup :label="steps[step]!" class="intake-form">
      <OperationFeedback :error="error" />
      <DraftConflictPanel
        v-if="conflict"
        :key="conflict.remote?.revision ?? 0"
        :conflict="conflict"
        :busy="busy"
        @merge="resolveConflict('merge', $event)"
        @remote="resolveConflict('remote')"
        @copy="resolveConflict('copy')"
      />
      <template v-else-if="ready">
        <MText role="status" aria-live="polite">{{ saveStatus }}</MText>
        <IntakeFields v-if="step < 3" v-model="input" :step="step" />
        <DraftPreview v-else :input="input" />
        <div v-if="issues.length" role="alert">
          <MText v-for="issue in issues" :key="issue">{{ issue }}</MText>
        </div>
        <OperationFeedback :message="message" />
        <MRow gap="sm" wrap>
          <MButton
            v-if="step > 0"
            text="Etapa anterior"
            variant="ghost"
            :disabled="busy"
            @click="step--"
          />
          <MButton
            text="Salvar rascunho"
            variant="secondary"
            :loading="busy"
            @click="save()"
          />
          <MButton
            v-if="step < 3"
            text="Continuar"
            :disabled="busy"
            @click="next"
          />
          <MButton
            v-else
            text="Enviar para revisão"
            :loading="busy"
            @click="save(true)"
          />
        </MRow>
      </template>
    </MFormGroup>
  </section>
</template>
