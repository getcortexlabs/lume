<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import {
  MButton,
  MCard,
  MColumn,
  MInput,
  MReveal,
  MRow,
  MText,
} from "@getcortexlabs/mavis-web";
import { usePreferences } from "../../preferences/composables/usePreferences";
const preferences = usePreferences();
const { state, ready, message } = preferences;
const route = useRoute();
const open = ref(false),
  name = ref(""),
  error = ref("");
const city = defineModel<string>("city", { required: true });
const placeholder = computed(() =>
  city.value ? `Avisos em ${city.value}` : "Minha busca",
);
function begin() {
  name.value = placeholder.value;
  error.value = "";
  open.value = !open.value;
}
function save() {
  error.value = preferences.saveSearch(name.value, route.query);
  if (!error.value) open.value = false;
}
</script>
<template>
  <MCard class="saved-searches" padding="md" gap="md">
    <MRow wrap gap="sm" align="center" justify="between">
      <MText as="h2" variant="heading">Suas buscas</MText>
      <MRow wrap gap="sm">
        <MButton
          v-if="state.region"
          :text="`Minha região: ${state.region}`"
          variant="ghost"
          size="sm"
          :disabled="!ready"
          @click="city = state.region"
        />
        <MButton
          text="Salvar esta busca"
          icon="bookmark"
          variant="secondary"
          size="sm"
          :disabled="!ready"
          :aria-expanded="open"
          @click="begin"
        />
      </MRow>
    </MRow>
    <MReveal :show="open">
      <form class="saved-search-form" @submit.prevent="save">
        <MInput
          id="saved-search-name"
          label="Nome da busca"
          v-model="name"
          :max-length="60"
        />
        <MButton
          text="Salvar busca"
          type="submit"
          :disabled="!ready || !name.trim()"
        />
      </form>
    </MReveal>
    <MText v-if="error" role="alert" tone="danger">{{ error }}</MText>
    <MColumn v-if="state.searches.length" gap="sm" aria-label="Buscas salvas">
      <MRow
        v-for="search in state.searches"
        :key="search.id"
        gap="sm"
        align="center"
        justify="between"
        class="saved-search-row"
      >
        <RouterLink
          :to="{ path: '/cases', query: search.query }"
          custom
          v-slot="{ href, navigate }"
          ><MButton
            :href="href"
            :navigate="() => navigate()"
            :text="search.name"
            variant="ghost"
            icon="search"
        /></RouterLink>
        <MButton
          icon="trash"
          variant="ghost"
          :accessibility-label="`Excluir busca ${search.name}`"
          @click="preferences.removeSearch(search.id)"
        />
      </MRow>
    </MColumn>
    <MText v-else as="p" variant="caption" tone="muted"
      >Salve os filtros para repetir uma busca. Os avisos são consultados
      novamente ao abrir.</MText
    >
    <MText v-if="message" role="status" variant="caption">{{ message }}</MText>
  </MCard>
</template>
<style scoped>
.saved-searches {
  margin-block: 20px;
}
.saved-search-form {
  display: flex;
  align-items: end;
  gap: 12px;
  padding-block: 8px;
}
.saved-search-form > :first-child {
  flex: 1;
  min-width: 0;
}
.saved-search-row {
  border-top: 1px solid var(--m-color-border);
  padding-top: 8px;
}
.saved-search-row > :first-child {
  min-width: 0;
  white-space: normal;
  text-align: left;
}
@media (max-width: 600px) {
  .saved-search-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
