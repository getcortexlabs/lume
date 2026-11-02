<script setup lang="ts">
import { computed, ref } from "vue";
import { MColumn, MText, MCard, MBadge, MRow } from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import type { CaseVersion } from "../../cases/domain/case";
import { compareVersions } from "../domain/version-comparison";
const props = defineProps<{ versions: CaseVersion[] }>();
const selected = ref(
  String(props.versions.at(-2)?.revision ?? props.versions[0]?.revision ?? ""),
);
const current = computed(() => props.versions.at(-1));
const previous = computed(() =>
  props.versions.find((v) => String(v.revision) === selected.value),
);
const rows = computed(() =>
  current.value && previous.value
    ? compareVersions(previous.value, current.value)
    : [],
);
const options = computed(() =>
  props.versions
    .slice(0, -1)
    .map((v) => ({ value: String(v.revision), label: `Versão ${v.revision}` })),
);
</script>
<template>
  <MColumn v-if="current" gap="md" class="version-history">
    <MRow gap="sm" wrap
      ><MText as="h3" variant="heading">O que mudou</MText
      ><MBadge :text="`Versão atual ${current.revision}`" tone="primary"
    /></MRow>
    <MText variant="caption"
      >{{ current.actor }} ·
      {{ new Date(current.at).toLocaleString("pt-BR") }}</MText
    >
    <MText>Motivo: {{ current.reason }}</MText>
    <MText v-if="versions.length < 2" tone="muted"
      >Esta é a primeira versão registrada. As próximas decisões poderão ser
      comparadas aqui.</MText
    >
    <template v-else>
      <AppSelect
        id="compare-version"
        v-model="selected"
        label="Comparar com"
        :options="options"
      />
      <MText v-if="previous" variant="caption"
        >Versão {{ previous.revision }} · {{ previous.actor }} ·
        {{ previous.reason }}</MText
      >
      <div class="version-differences">
        <MCard
          v-for="row in rows"
          :key="row.label"
          padding="md"
          gap="xs"
          :data-changed="row.changed"
        >
          <MText as="h4" variant="heading">{{ row.label }}</MText>
          <MBadge v-if="row.changed" text="Alterado" tone="primary" />
          <MText variant="caption">Antes · {{ row.before }}</MText>
          <MText>Agora · {{ row.after }}</MText>
        </MCard>
      </div>
    </template>
  </MColumn>
</template>
<style scoped>
.version-history {
  border-top: 1px solid var(--line);
  padding-top: 24px;
  min-width: 0;
}
.version-differences {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  overflow-wrap: anywhere;
}
.version-differences [data-changed="true"] {
  outline: 2px solid #748c4c;
}
@media (max-width: 760px) {
  .version-differences {
    grid-template-columns: 1fr;
  }
}
</style>
