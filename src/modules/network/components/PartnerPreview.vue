<script setup lang="ts">
import {
  textStyle,
  flowStyle,
  cardStyle,
} from "../../../shared/ui/mavis-styles";
import {
  MCard,
  MColumn,
  MIcon,
  MRow,
  MText,
  MButton,
} from "@getcortexlabs/mavis-web";
import PersonArtwork from "../../cases/components/PersonArtwork.vue";
import type { PublicCase } from "../../cases/domain/case";
defineProps<{ record?: PublicCase; mode: string; hasNext: boolean }>();
defineEmits<{ next: [] }>();
</script>
<template>
  <div class="widget-stage" :class="{ 'screen-mode': mode === 'screen' }">
    <MText
      class="preview-label"
      data-mavis-text
      as="span"
      variant="caption"
      tone="text"
      :style="textStyle('caption', 'text')"
      >PRÉVIA · {{ mode === "screen" ? "TELA" : "WIDGET" }}</MText
    >
    <MCard
      class="partner-widget"
      data-mavis-card
      padding="none"
      radius="md"
      :style="cardStyle"
    >
      <MRow class="widget-top" data-mavis-flow :style="flowStyle('row')">
        <strong
          >lume<MText
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >✳</MText
          ></strong
        ><MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >Um olhar pode ajudar.</MText
        >
      </MRow>
      <template v-if="record">
        <PersonArtwork :initials="record.initials" :color="record.color" />
        <MColumn
          class="widget-info"
          data-mavis-flow
          :style="flowStyle('column')"
        >
          <MText
            class="eyebrow"
            data-mavis-text
            as="span"
            variant="overline"
            tone="text"
            :style="textStyle('overline', 'text')"
            >{{ record.city }}, SP · FICTÍCIO</MText
          >
          <MText
            data-mavis-text
            as="h2"
            variant="title"
            tone="text"
            :style="textStyle('title', 'text')"
            >{{ record.name }}</MText
          >
          <MText
            data-mavis-text
            as="p"
            variant="body"
            tone="muted"
            :style="textStyle('body', 'muted')"
            >{{ record.age }} anos · {{ record.neighborhood }}</MText
          >
          <RouterLink :to="`/cases/${record.id}`" class="button-link"
            >Consultar aviso <MIcon name="arrow-up-right" size="sm"
          /></RouterLink>
        </MColumn>
      </template>
      <div v-else class="empty-state">
        <MIcon name="sun" :size="36" />
        <MText
          data-mavis-text
          as="h3"
          variant="heading"
          tone="text"
          :style="textStyle('heading', 'text')"
          >Nenhum aviso disponível.</MText
        >
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >Não há publicações ativas nesta região.</MText
        >
      </div>
      <MRow class="widget-footer" data-mavis-flow :style="flowStyle('row')">
        <MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >Informação com origem. Cuidado sempre.</MText
        ><MButton
          v-if="hasNext"
          variant="ghost"
          icon="arrow-right"
          size="sm"
          accessibility-label="Próximo aviso"
          @click="$emit('next')"
        />
      </MRow>
    </MCard>
    <MText
      class="small"
      data-mavis-text
      as="p"
      variant="body"
      tone="muted"
      :style="textStyle('body', 'muted')"
      >Somente avisos ativos na região selecionada.</MText
    >
  </div>
</template>
