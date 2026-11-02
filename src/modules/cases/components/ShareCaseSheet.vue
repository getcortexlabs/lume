<script setup lang="ts">
import { computed } from "vue";
import {
  MBadge,
  MButton,
  MCard,
  MColumn,
  MInput,
  MRow,
  MText,
} from "@getcortexlabs/mavis-web";
import AppDialog from "../../../shared/components/AppDialog.vue";
import { useClipboard } from "../../../shared/composables/useClipboard";
import { formatDate, type PublicCase } from "../domain/case";
const props = defineProps<{ open: boolean; record: PublicCase; url: string }>();
defineEmits<{ close: [] }>();
const { message, copy } = useClipboard();
const summary = computed(() =>
  [
    "DEMONSTRAÇÃO LUME — pessoa e aviso fictícios. Não é uma busca real.",
    "",
    `${props.record.name} · ${props.record.age} anos`,
    `${props.record.city}, SP`,
    `Origem: ${props.record.source}.`,
    `Desaparecimento informado: ${formatDate(props.record.missingSince)}.`,
    `Revisão da divulgação: ${formatDate(props.record.reviewedAt)} · versão ${props.record.revision}.`,
    "",
    "Consulte a página para ver a versão atual desta demonstração:",
    props.url,
  ].join("\n"),
);
</script>
<template>
  <AppDialog
    :open="open"
    title="Compartilhar com cuidado"
    @close="$emit('close')"
  >
    <MText tone="muted"
      >Uma informação útil também precisa estar atualizada. A página do aviso
      reúne a versão pública disponível.</MText
    >
    <MCard padding="lg" gap="md" class="share-case-preview">
      <MBadge
        text="Demonstração · dados fictícios"
        tone="primary"
        :style="{ alignSelf: 'flex-start' }"
      />
      <MColumn gap="xs">
        <MText as="h3" variant="heading">{{ record.name }}</MText>
        <MText variant="caption" tone="muted"
          >{{ record.age }} anos · {{ record.city }}, SP</MText
        >
      </MColumn>
      <MText variant="caption" tone="muted"
        >Revisão em {{ formatDate(record.reviewedAt) }} · versão
        {{ record.revision }}</MText
      >
    </MCard>
    <MInput label="Link da demonstração" :model-value="url" readonly />
    <MInput
      label="Texto de demonstração"
      :model-value="summary"
      multiline
      :rows="7"
      readonly
    />
    <MRow gap="sm" wrap>
      <MButton
        text="Copiar link"
        icon="link"
        @click="copy(url, 'Link da demonstração copiado.')"
      />
      <MButton
        text="Copiar texto"
        icon="copy"
        variant="secondary"
        @click="copy(summary, 'Texto de demonstração copiado.')"
      />
    </MRow>
    <MText v-if="message" role="status" variant="caption">{{ message }}</MText>
    <MText variant="caption" tone="muted"
      >Este protótipo não envia mensagens nem publica em redes sociais. Uma
      cópia do texto não acompanha futuras atualizações; consulte sempre o
      link.</MText
    >
  </AppDialog>
</template>
