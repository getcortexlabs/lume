<script setup lang="ts">
import { computed } from "vue";
import { MPagination } from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
const props = defineProps<{
  total: number;
  page: number;
  pageSize: string;
  busy: boolean;
}>();
defineEmits<{ page: [number]; pageSize: [string] }>();
const pages = computed(() =>
  Math.max(1, Math.ceil(props.total / Number(props.pageSize))),
);
</script>
<template>
  <div class="case-pagination">
    <AppSelect
      id="case-page-size"
      label="Avisos por página"
      :model-value="pageSize"
      :options="[
        { value: '2', label: '2 avisos' },
        { value: '4', label: '4 avisos' },
        { value: '12', label: '12 avisos' },
      ]"
      @update:model-value="$emit('pageSize', $event)"
    />
    <MPagination
      :model-value="page"
      :total="total"
      :page-size="Number(pageSize)"
      :loading="busy"
      label="Páginas de resultados"
      previous-label="Página anterior"
      next-label="Próxima página"
      page-label="Página"
      current-label="Página atual"
      empty-label="Nenhum resultado"
      invalid-page-label="Esta página não está mais disponível."
      :status-text="`Página ${page} de ${pages}`"
      @update:model-value="$emit('page', $event)"
    />
  </div>
</template>
