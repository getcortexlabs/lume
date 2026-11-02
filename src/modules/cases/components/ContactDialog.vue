<script setup lang="ts">
import { textStyle, cardStyle } from "../../../shared/ui/mavis-styles";
import AppDialog from "../../../shared/components/AppDialog.vue";
import { MButton, MCard, MIcon, MText } from "@getcortexlabs/mavis-web";
defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();
</script>
<template>
  <AppDialog
    :open="open"
    title="Uma informação merece cuidado."
    @close="$emit('close')"
    ><div class="dialog-icon"><MIcon name="shield-check" :size="30" /></div>
    <MText
      data-mavis-text
      as="p"
      variant="body"
      tone="muted"
      :style="textStyle('body', 'muted')"
    >
      Em uma publicação real, este espaço apresenta o canal da organização
      responsável para receber informações de forma reservada.
    </MText>
    <MCard
      class="soft-note"
      data-mavis-card
      padding="none"
      radius="md"
      :style="cardStyle"
    >
      <strong>Este é um caso fictício.</strong>
      <MText
        data-mavis-text
        as="p"
        variant="body"
        tone="muted"
        :style="textStyle('body', 'muted')"
      >
        Não há equipe de atendimento conectada e nenhum relato é recebido nesta
        demonstração.
      </MText>
    </MCard>
    <MText
      class="muted"
      data-mavis-text
      as="p"
      variant="body"
      tone="muted"
      :style="textStyle('body', 'muted')"
    >
      Evite divulgar locais precisos, contatos pessoais ou informações não
      confirmadas em redes sociais.
    </MText>
    <MButton text="Entendi" width="100%" @click="$emit('close')"
  /></AppDialog>
</template>
