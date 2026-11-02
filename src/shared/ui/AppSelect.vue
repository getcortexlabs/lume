<script setup lang="ts">
import { useClientReady } from "../composables/useClientReady";
const clientReady = useClientReady();
import { MSelect, type ChoiceOption } from "@getcortexlabs/mavis-web";
defineProps<{
  id: string;
  label: string;
  options: readonly ChoiceOption[];
  grow?: number;
}>();
const model = defineModel<string>({ required: true });
const emit = defineEmits<{ change: [] }>();
function choose(value: string | number | null) {
  if (typeof value !== "string") return;
  model.value = value;
  emit("change");
}
</script>
<template>
  <MSelect
    :disabled="!clientReady"
    :id="id"
    :label="label"
    :options="options"
    :model-value="model"
    :grow="grow ?? 0"
    :shrink="1"
    width="100%"
    class="lume-select"
    placeholder="Escolha uma opção"
    close-label="Fechar seleção"
    empty-text="Nenhuma opção disponível"
    @update:model-value="choose"
  />
</template>
