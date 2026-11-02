<script setup lang="ts">
import { MBadge, MCard, MColumn, MIcon, MText } from "@getcortexlabs/mavis-web";
import {
  cardStyle,
  flowStyle,
  textStyle,
} from "../../../shared/ui/mavis-styles";
import type { ReviewCase, PublicationStatus } from "../../cases/domain/case";
defineProps<{ records: ReviewCase[]; selected: string }>();
defineEmits<{ select: [id: string] }>();
const labels: Record<PublicationStatus, string> = {
  in_review: "Em revisão",
  published: "Publicado",
  withdrawn: "Retirado",
};
</script>
<template>
  <MColumn class="review-queue" data-mavis-flow :style="flowStyle('column')">
    <MCard
      v-for="record in records"
      :key="record.id"
      interactive
      padding="none"
      radius="none"
      class="queue-item"
      data-mavis-card
      :data-selected="record.id === selected"
      :aria-pressed="record.id === selected"
      :style="{
        ...cardStyle,
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
        borderLeft: '3px solid var(--queue-accent, transparent)',
        borderRadius: 0,
      }"
      @click="$emit('select', record.id)"
    >
      <MText
        class="queue-avatar"
        :class="record.color"
        data-mavis-text
        as="span"
        variant="caption"
        :style="textStyle('caption')"
        >{{ record.initials }}</MText
      >
      <MColumn :grow="1" gap="xs" class="queue-summary">
        <MText
          as="span"
          variant="caption"
          :style="{ fontWeight: 600, fontSize: '12px' }"
          >{{ record.name }}</MText
        >
        <MText
          as="span"
          variant="caption"
          tone="muted"
          :style="{ fontSize: '10px' }"
          >{{ record.city }} · {{ record.age }} anos</MText
        >
        <MBadge
          :text="labels[record.status]"
          size="sm"
          :tone="
            record.status === 'published'
              ? 'success'
              : record.status === 'withdrawn'
                ? 'neutral'
                : 'primary'
          "
          :style="{ alignSelf: 'flex-start' }"
        />
      </MColumn>
      <MIcon name="chevron-right" size="sm" />
    </MCard>
    <MText
      v-if="!records.length"
      class="empty-state"
      variant="body"
      tone="muted"
      >Nenhum registro neste filtro.</MText
    >
  </MColumn>
</template>
