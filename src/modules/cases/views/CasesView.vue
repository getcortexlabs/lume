<script setup lang="ts">
import { useListLayout } from "../../../shared/motion/useListLayout";
import { textStyle, flowStyle } from "../../../shared/ui/mavis-styles";
import { computed, ref } from "vue";
import { useCaseSearch } from "../composables/useCaseSearch";
import CasePagination from "../components/CasePagination.vue";
import ActiveCaseFilters from "../components/ActiveCaseFilters.vue";
import CaseResultsToolbar from "../components/CaseResultsToolbar.vue";
import {
  MBox,
  MButton,
  MColumn,
  MIcon,
  MText,
  MEmptyState,
  MSkeleton,
  MCard,
} from "@getcortexlabs/mavis-web";
import CasePeriodFilters from "../components/CasePeriodFilters.vue";
import CaseFilters from "../components/CaseFilters.vue";
import SavedSearches from "../components/SavedSearches.vue";
import CaseCard from "../components/CaseCard.vue";
import { usePublicResults } from "../composables/usePublicResults";
const {
  query,
  city,
  age,
  order,
  dateField,
  from,
  to,
  page,
  pageSize,
  filters,
  context,
  activeFilters,
  removeFilter,
  reset,
} = useCaseSearch();
const { data, loading, error, refresh } = usePublicResults(
  computed(() => ({
    ...filters.value,
    sort: order.value as "reviewed" | "missing" | "name",
    page: Number(page.value),
    pageSize: Number(pageSize.value),
  })),
);
const records = computed(() => data.value.items);
const grid = ref<HTMLElement | null>(null);
const resultsRegion = useListLayout(grid, records);
</script>
<template>
  <section class="wrap page-section">
    <MColumn class="page-heading" data-mavis-flow :style="flowStyle('column')">
      <MText
        class="eyebrow"
        data-mavis-text
        as="span"
        variant="overline"
        tone="text"
        :style="textStyle('overline', 'text')"
        >CADA PESSOA IMPORTA</MText
      >
      <h1>Olhar com atenção<br />já é um começo.</h1>
      <MText
        data-mavis-text
        as="p"
        variant="body"
        tone="muted"
        :style="textStyle('body', 'muted')"
      >
        Encontre avisos da sua região. Uma informação pode fazer a diferença.
      </MText>
    </MColumn>
    <CaseFilters
      v-model:query="query"
      v-model:city="city"
      v-model:age="age"
      @reset="reset"
    />
    <CasePeriodFilters
      v-model:date-field="dateField"
      v-model:from="from"
      v-model:to="to"
    />
    <SavedSearches v-model:city="city" />
    <ActiveCaseFilters :filters="activeFilters" @remove="removeFilter" />
    <CaseResultsToolbar
      v-model="order"
      :count="data.total"
      :loading="loading"
      :city="city"
    />
    <MBox :motion-region="resultsRegion" :style="{ display: 'block' }">
      <div v-if="error" class="empty-state" role="alert">
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >{{ error }}</MText
        >
        <MButton text="Tentar novamente" @click="refresh" />
      </div>
      <MEmptyState
        v-else-if="!loading && !records.length"
        title="Nenhum aviso por aqui."
        description="Tente outro nome ou amplie a região da busca."
        icon="search"
      >
        <template #actions
          ><MButton text="Limpar filtros" variant="secondary" @click="reset"
        /></template>
      </MEmptyState>
      <div
        v-else-if="loading && !records.length"
        class="case-grid"
        aria-label="Carregando avisos"
        aria-busy="true"
      >
        <MCard
          v-for="item in 4"
          :key="item"
          gap="md"
          padding="md"
          aria-hidden="true"
        >
          <MSkeleton :height="180" :animated="false" />
          <MSkeleton width="70%" :height="20" :animated="false" />
          <MSkeleton width="90%" :animated="false" />
        </MCard>
      </div>
      <div v-else ref="grid" class="case-grid">
        <div v-for="record in records" :key="record.id" class="case-item">
          <div :data-case-id="record.id" class="case-entrance">
            <CaseCard :record="record" :search-context="context" />
          </div>
        </div>
      </div>
    </MBox>
    <CasePagination
      v-if="!error"
      :total="data.total"
      :page="data.page"
      :page-size="pageSize"
      :busy="loading"
      @page="page = String($event)"
      @page-size="pageSize = $event"
    />
    <aside class="soft-callout">
      <MIcon name="heart-handshake" :size="26" />
      <div>
        <strong>Está procurando alguém e precisa de orientação?</strong>
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >Organizamos os primeiros passos para ajudar você neste
          momento.</MText
        >
      </div>
      <RouterLink class="text-link" to="/guidance"
        >Ver orientação <MIcon name="arrow-right" size="sm"
      /></RouterLink>
    </aside>
  </section>
</template>
