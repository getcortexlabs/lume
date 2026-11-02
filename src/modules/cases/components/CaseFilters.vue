<script setup lang="ts">
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { cityOptions, ageOptions } from "../presentation/choices";
import { MButton, MInput } from "@getcortexlabs/mavis-web";
const query = defineModel<string>("query", { required: true });
const city = defineModel<string>("city", { required: true });
const age = defineModel<string>("age", { required: true });
defineEmits<{ reset: [] }>();
</script>
<template>
  <div class="filter-bar">
    <MInput
      id="filter-query"
      v-model="query"
      label="Nome ou cidade"
      placeholder="Quem você está procurando?"
      icon="search"
      type="search"
    />
    <AppSelect
      id="filter-city"
      label="Cidade"
      v-model="city"
      :options="cityOptions"
    />
    <AppSelect
      id="filter-age"
      label="Faixa etária"
      v-model="age"
      :options="ageOptions"
    />
    <MButton
      variant="ghost"
      text="Limpar"
      icon="rotate-ccw"
      @click="$emit('reset')"
    />
  </div>
</template>
