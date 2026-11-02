<script setup lang="ts">
import { useClientReady } from "../composables/useClientReady";
const clientReady = useClientReady();
import { textStyle, flowStyle } from "../ui/mavis-styles";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  MIcon,
  MRow,
  MText,
  MButton,
  MSheet,
  MColumn,
} from "@getcortexlabs/mavis-web";
import BrandLogo from "./BrandLogo.vue";
const open = ref(false);
const route = useRoute();
watch(
  () => route.path,
  () => {
    open.value = false;
  },
);
</script>
<template>
  <MRow class="demo-strip" data-mavis-flow :style="flowStyle('row')">
    <span class="demo-dot"></span> Uma primeira luz.
    <MText
      data-mavis-text
      as="span"
      variant="caption"
      tone="text"
      :style="textStyle('caption', 'text')"
      >Você está explorando uma demonstração com dados fictícios.</MText
    >
  </MRow>
  <header class="site-header wrap">
    <BrandLogo />
    <MButton
      :disabled="!clientReady"
      class="mobile-menu"
      variant="ghost"
      size="sm"
      :icon="open ? 'x' : 'menu'"
      :accessibility-label="open ? 'Fechar menu' : 'Abrir menu'"
      :aria-expanded="open"
      :style="{ display: 'var(--mobile-menu-display, none)' }"
      @click="open = !open"
    />
    <nav aria-label="Navegação principal">
      <RouterLink to="/cases">Encontrar avisos</RouterLink
      ><RouterLink to="/guidance">Preciso de orientação</RouterLink
      ><RouterLink to="/network"
        >Rede de cuidado <MIcon name="arrow-up-right" size="sm"
      /></RouterLink>
    </nav>
    <RouterLink to="/preferences" custom v-slot="{ href, navigate }"
      ><MButton
        :href="href"
        :navigate="() => navigate()"
        icon="settings"
        variant="ghost"
        size="sm"
        accessibility-label="Preferências e acessibilidade"
    /></RouterLink>
    <RouterLink class="organization-link" to="/organization"
      ><MIcon name="panels-top-left" size="sm" /> Área da
      organização</RouterLink
    >
    <MSheet
      :open="open"
      title="Encontre seu caminho"
      close-label="Fechar menu"
      @update:open="open = $event"
    >
      <MColumn gap="lg" padding-y="md" class="mobile-navigation">
        <RouterLink to="/cases"
          >Encontrar avisos <MIcon name="arrow-up-right" size="sm"
        /></RouterLink>
        <RouterLink to="/guidance"
          >Preciso de orientação <MIcon name="arrow-up-right" size="sm"
        /></RouterLink>
        <RouterLink to="/network"
          >Rede de cuidado <MIcon name="arrow-up-right" size="sm"
        /></RouterLink>
        <RouterLink to="/organization"
          >Área da organização <MIcon name="arrow-up-right" size="sm"
        /></RouterLink>
        <RouterLink to="/preferences"
          >Preferências e acessibilidade <MIcon name="settings" size="sm"
        /></RouterLink>
      </MColumn>
    </MSheet>
  </header>
</template>
