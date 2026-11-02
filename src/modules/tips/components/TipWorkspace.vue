<script setup lang="ts">
import { ref } from "vue";
import {
  MColumn,
  MText,
  MCard,
  MInput,
  MButton,
  MBadge,
} from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import {
  tipLabels,
  tipRecipients,
  type Tip,
  type TipStatus,
} from "../domain/tip";
defineProps<{ tip: Tip; busy: boolean }>();
defineEmits<{
  advance: [
    status: Exclude<TipStatus, "received">,
    note: string,
    recipient: string | null,
  ];
}>();
const note = ref(""),
  recipient = ref("");
</script>
<template>
  <MColumn gap="lg" class="tip-workspace">
    <MText as="h2" variant="title">Relato reservado</MText
    ><MBadge :text="tipLabels[tip.status]" />
    <MCard padding="lg" gap="md"
      ><MText as="h3" variant="heading">Relato original · fictício</MText
      ><MText>{{ tip.original }}</MText
      ><MText>{{ tip.observedAt }}</MText
      ><MText>{{ tip.location }}</MText
      ><MText>{{ tip.contact || "Contato não informado." }}</MText></MCard
    >
    <MText variant="caption"
      >Dúvidas e horários aproximados fazem parte da informação. O original
      permanece preservado em todas as etapas.</MText
    >
    <RouterLink
      :to="{ path: '/organization', query: { case: tip.caseId } }"
      class="text-link"
      >Consultar o aviso na revisão</RouterLink
    >
    <template v-if="tip.status !== 'confirmed'">
      <MInput
        :disabled="busy"
        v-model="note"
        label="Registro da etapa"
        multiline
        :rows="3"
        placeholder="Use apenas uma justificativa fictícia."
      />
      <AppSelect
        v-if="tip.status === 'reviewed'"
        id="tip-recipient"
        v-model="recipient"
        label="Destinatário de demonstração"
        :options="tipRecipients"
      />
      <MButton
        v-if="tip.status === 'received'"
        text="Concluir triagem"
        :disabled="!note.trim() || busy"
        @click="$emit('advance', 'reviewed', note, null)"
      />
      <MButton
        v-if="tip.status === 'reviewed'"
        text="Simular encaminhamento"
        :disabled="!note.trim() || !recipient || busy"
        @click="$emit('advance', 'forwarded', note, recipient)"
      />
      <MButton
        v-if="tip.status === 'forwarded'"
        text="Simular confirmação do destinatário"
        :disabled="!note.trim() || busy"
        @click="$emit('advance', 'confirmed', note, tip.recipient)"
      />
    </template>
    <MText v-if="tip.recipient"
      >Destinatário:
      {{ tipRecipients.find((r) => r.value === tip.recipient)?.label }}</MText
    >
    <MText v-if="tip.status === 'forwarded'"
      >Encaminhamento simulado registrado. O destinatário ainda não confirmou
      recebimento.</MText
    >
    <MText v-if="tip.status === 'confirmed'"
      >Recebimento confirmado na simulação. Isso não confirma a veracidade do
      relato nem a localização da pessoa.</MText
    >
    <MText as="h3" variant="heading">Percurso do relato</MText>
    <MCard
      v-for="(event, index) in tip.history"
      :key="index"
      padding="md"
      gap="sm"
      ><MText>{{ tipLabels[event.status] }} · {{ event.actor }}</MText
      ><MText>{{ event.note }}</MText
      ><MText variant="caption">{{
        new Date(event.at).toLocaleString("pt-BR")
      }}</MText></MCard
    >
  </MColumn>
</template>
<style scoped>
.tip-workspace {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
