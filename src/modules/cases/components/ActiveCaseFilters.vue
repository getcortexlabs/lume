<script setup lang="ts">
import { MChip, MRow, MText } from "@getcortexlabs/mavis-web";
import type { ActiveCaseFilter } from "../presentation/search-state";
defineProps<{ filters: ActiveCaseFilter[] }>();
defineEmits<{ remove: [key: ActiveCaseFilter["key"]] }>();
</script>
<template>
  <MRow
    v-if="filters.length"
    gap="sm"
    wrap
    class="active-case-filters"
    role="group"
    aria-label="Filtros ativos"
  >
    <MText as="span" variant="caption" tone="muted">Sua busca</MText>
    <MChip
      v-for="filter in filters"
      :key="filter.key"
      :label="filter.label"
      removable
      :remove-label="filter.removeLabel"
      @remove="$emit('remove', filter.key)"
    />
  </MRow>
</template>
