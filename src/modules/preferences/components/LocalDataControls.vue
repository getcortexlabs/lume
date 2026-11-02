<script setup lang="ts">
import { MButton, MCard, MColumn, MRow, MText } from "@getcortexlabs/mavis-web";
import AppDialog from "../../../shared/components/AppDialog.vue";
import { useLocalData } from "../composables/useLocalData";
const {
  preferences,
  selected,
  open,
  message,
  error,
  draftCount,
  organization,
  descriptions,
  begin,
  confirm,
} = useLocalData();
</script>
<template>
  <MCard padding="lg" gap="lg">
    <MText as="h2" variant="title">Dados neste navegador</MText>
    <MText as="p" tone="muted"
      >Escolha o que deseja limpar. Cada ação tem uma confirmação própria e
      afeta apenas os dados locais indicados.</MText
    >
    <MColumn gap="sm"
      ><MText as="h3" variant="heading">Buscas salvas</MText
      ><MText as="p"
        >{{ preferences.state.value.searches.length }} busca(s) neste
        navegador.</MText
      ><MButton
        text="Excluir buscas salvas"
        variant="secondary"
        :disabled="
          !preferences.ready.value || !preferences.state.value.searches.length
        "
        @click="begin('searches')"
    /></MColumn>
    <MColumn gap="sm"
      ><MText as="h3" variant="heading">Preferências</MText
      ><MText as="p">Região, tamanho do texto, contraste e movimento.</MText
      ><MButton
        text="Limpar preferências"
        variant="secondary"
        :disabled="!preferences.ready.value"
        @click="begin('preferences')"
    /></MColumn>
    <MColumn gap="sm"
      ><MText as="h3" variant="heading">Rascunhos da organização</MText
      ><MText as="p"
        >{{ organization }} ·
        {{
          draftCount === null
            ? "Contagem indisponível"
            : `${draftCount} rascunho(s) salvo(s)`
        }}</MText
      ><MButton
        text="Excluir rascunhos desta organização"
        variant="secondary"
        :disabled="!preferences.ready.value || draftCount === 0"
        @click="begin('drafts')"
      /><RouterLink to="/organization/settings" class="text-link"
        >Escolher outra organização →</RouterLink
      ></MColumn
    >
    <MText v-if="message" role="status">{{ message }}</MText>
    <AppDialog
      :open="open"
      title="Confirmar limpeza de dados"
      @close="open = false"
    >
      <MText as="p">{{ selected ? descriptions[selected] : "" }}</MText>
      <MText v-if="error" role="alert" tone="danger">{{ error }}</MText>
      <MRow gap="sm" wrap
        ><MButton
          text="Cancelar"
          variant="secondary"
          @click="open = false" /><MButton
          text="Confirmar limpeza"
          @click="confirm"
      /></MRow>
    </AppDialog>
  </MCard>
</template>
