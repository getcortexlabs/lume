<script setup lang="ts">
import { computed } from "vue";
import type { LocationQueryRaw, LocationQuery } from "vue-router";
import { MText } from "@getcortexlabs/mavis-web";
import { useCases } from "../composables/useCases";
import { readCaseSearch, orderPublicCases } from "../presentation/search-state";
const props = defineProps<{ id: string; context: LocationQueryRaw }>();
const state = computed(() => readCaseSearch(props.context as LocationQuery));
const { data } = useCases(
  computed(() => ({
    query: state.value.search,
    city: state.value.city,
    age: state.value.age,
    from: state.value.from,
    to: state.value.to,
    dateField: state.value.dateField as "missing" | "reviewed",
  })),
);
const ordered = computed(() => orderPublicCases(data.value, state.value.sort));
const index = computed(() =>
  ordered.value.findIndex((record) => record.id === props.id),
);
const previous = computed(() => ordered.value[index.value - 1]);
const next = computed(() =>
  index.value < 0 ? undefined : ordered.value[index.value + 1],
);
</script>
<template>
  <nav
    v-if="index >= 0"
    class="case-neighbors"
    aria-label="Navegar pelos resultados"
  >
    <RouterLink
      v-if="previous"
      :to="{ path: `/cases/${previous.id}`, query: context }"
      class="text-link"
      ><span aria-hidden="true">← </span>Aviso anterior</RouterLink
    >
    <MText variant="caption" tone="muted"
      >{{ index + 1 }} de {{ ordered.length }} avisos nesta busca</MText
    >
    <RouterLink
      v-if="next"
      :to="{ path: `/cases/${next.id}`, query: context }"
      class="text-link"
      >Próximo aviso<span aria-hidden="true"> →</span></RouterLink
    >
  </nav>
</template>
