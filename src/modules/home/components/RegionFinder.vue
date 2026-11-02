<script setup lang="ts">
import { useClientReady } from "../../../shared/composables/useClientReady";
const clientReady = useClientReady();
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { textStyle } from "../../../shared/ui/mavis-styles";
import { cityOptions } from "../../cases/presentation/choices";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { MButton, MIcon, MText } from "@getcortexlabs/mavis-web";
const city = ref("");
const router = useRouter();
function explore() {
  router.push({
    path: "/cases",
    query: city.value ? { city: city.value } : {},
  });
}
</script>
<template>
  <section class="region-bar wrap" aria-label="Encontre avisos perto de você">
    <span class="region-icon"><MIcon name="map-pin" :size="23" /></span>
    <div>
      <MText
        class="region-kicker"
        data-mavis-text
        as="span"
        variant="caption"
        tone="text"
        :style="textStyle('caption', 'text')"
        >COMECE POR PERTO</MText
      ><strong>Seu próximo olhar pode ajudar.</strong>
    </div>
    <form @submit.prevent="explore">
      <AppSelect
        class="regional-select"
        :grow="1"
        id="home-city"
        label="Escolha sua cidade"
        v-model="city"
        :options="cityOptions"
      /><MButton
        :disabled="!clientReady"
        text="Explorar região"
        trailing-icon="arrow-right"
        type="submit"
      />
    </form>
  </section>
</template>
