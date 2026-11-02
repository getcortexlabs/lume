<script setup lang="ts">
import { computed } from "vue";
import { MButton, MCard, MColumn, MText } from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { cityOptions } from "../../cases/presentation/choices";
import { usePreferences } from "../composables/usePreferences";
import LocalDataControls from "../components/LocalDataControls.vue";
const preferences = usePreferences();
const { state, ready, message, systemReduced } = preferences;
const region = computed({
  get: () => state.value.region,
  set: (value: string) => preferences.update({ region: value }),
});
const textSize = computed({
  get: () => state.value.textSize,
  set: (value: string) =>
    preferences.update({ textSize: value === "large" ? "large" : "standard" }),
});
const contrast = computed({
  get: () => state.value.contrast,
  set: (value: string) =>
    preferences.update({ contrast: value === "high" ? "high" : "standard" }),
});
const motion = computed({
  get: () => state.value.motion,
  set: (value: string) =>
    preferences.update({ motion: value === "reduced" ? "reduced" : "system" }),
});
</script>
<template>
  <section class="wrap page-section preferences-page">
    <div class="page-heading">
      <p class="eyebrow">DO SEU JEITO</p>
      <h1>Mais conforto para navegar.</h1>
      <p>
        Suas escolhas ficam neste navegador. Você pode alterá-las quando quiser.
      </p>
    </div>
    <MColumn gap="lg">
      <MCard padding="lg" gap="md">
        <MText as="h2" variant="title">Sua região</MText>
        <MText as="p" tone="muted"
          >A cidade escolhida preenche a seleção da página inicial. Links
          recebidos e filtros de busca continuam como você escolheu.</MText
        >
        <AppSelect
          id="preferred-region"
          label="Região preferida"
          :options="cityOptions"
          v-model="region"
        />
      </MCard>
      <MCard padding="lg" gap="lg">
        <MText as="h2" variant="title">Leitura e movimento</MText>
        <AppSelect
          id="preferred-text-size"
          label="Tamanho do texto"
          v-model="textSize"
          :options="[
            { value: 'standard', label: 'Padrão' },
            { value: 'large', label: 'Texto maior' },
          ]"
        />
        <AppSelect
          id="preferred-contrast"
          label="Contraste"
          v-model="contrast"
          :options="[
            { value: 'standard', label: 'Padrão' },
            { value: 'high', label: 'Contraste reforçado' },
          ]"
        />
        <AppSelect
          id="preferred-motion"
          label="Animações"
          v-model="motion"
          :options="[
            { value: 'system', label: 'Seguir o dispositivo' },
            { value: 'reduced', label: 'Reduzir animações' },
          ]"
        />
        <MText v-if="systemReduced" as="p" tone="muted"
          >Seu dispositivo pede movimento reduzido. Essa preferência será
          respeitada nas duas opções.</MText
        >
        <MButton
          :disabled="!ready"
          text="Restaurar leitura e movimento"
          variant="secondary"
          @click="preferences.resetAppearance()"
        />
      </MCard>
      <MText v-if="message" role="status" aria-live="polite">{{
        message
      }}</MText>
      <RouterLink to="/cases" class="text-link"
        >Ver avisos e buscas salvas →</RouterLink
      >
      <LocalDataControls />
    </MColumn>
  </section>
</template>
<style scoped>
.preferences-page {
  max-width: 800px;
}
</style>
