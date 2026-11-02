<script setup lang="ts">
import { ref, watch } from "vue";
import {
  MDatePicker,
  isCivilDate,
  type CivilDate,
  type InputHandle,
} from "@getcortexlabs/mavis-web";
/** String/null and persisted-draft adaptation only. Mavis owns all editors and hydration. */
const props = defineProps<{
  id: string;
  label: string;
  max?: CivilDate;
  preserveDraft?: boolean;
}>();
const model = defineModel<string>({ required: true });
const draft = ref(model.value),
  canonical = ref<CivilDate | null>(
    isCivilDate(model.value) ? model.value : null,
  ),
  field = ref<InputHandle>();
watch(model, (value) => {
  if (value === draft.value) return;
  draft.value = value;
  canonical.value = isCivilDate(value) ? value : null;
});
function edit(value: string) {
  draft.value = value;
  if (props.preserveDraft) model.value = value;
}
function accept(value: CivilDate | null) {
  canonical.value = value;
  if (!props.preserveDraft) model.value = value ?? "";
}
defineExpose({
  focus: () => field.value?.focus(),
  blur: () => field.value?.blur(),
});
</script>
<template>
  <div class="app-date-field">
    <MDatePicker
      ref="field"
      :id="id"
      :label="label"
      :model-value="canonical"
      :draft="draft"
      :max="max"
      locale="pt-BR"
      initial-month="2026-11"
      helper-text="Digite AAAA-MM-DD ou escolha no calendário."
      @update:draft="edit"
      @update:model-value="accept"
    />
  </div>
</template>

<style scoped>
.app-date-field {
  min-width: 0;
}
</style>
