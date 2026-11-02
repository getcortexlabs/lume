<script setup lang="ts">
import { textStyle, flowStyle } from "../ui/mavis-styles";
import { MColumn, MRow, MText } from "@getcortexlabs/mavis-web";
import BrandLogo from "./BrandLogo.vue";
</script>
<template>
  <footer class="site-footer wrap">
    <div>
      <BrandLogo />
      <p>Informação que conecta.<br />Cuidado que aproxima.</p>
    </div>
    <MColumn class="footer-links" data-mavis-flow :style="flowStyle('column')">
      <RouterLink to="/cases">Encontrar avisos</RouterLink
      ><RouterLink to="/guidance">Orientação e cuidado</RouterLink
      ><RouterLink to="/network">Faça parte da rede</RouterLink>
      <RouterLink to="/preferences">Preferências e acessibilidade</RouterLink>
    </MColumn>
    <MColumn class="footer-note" data-mavis-flow :style="flowStyle('column')">
      <MText
        data-mavis-text
        as="span"
        variant="caption"
        tone="text"
        :style="textStyle('caption', 'text')"
        >FEITO COM PROPÓSITO</MText
      >
      <p>Uma iniciativa Cortex Labs.<br />Cada pessoa importa. Sempre.</p>
      <small>Protótipo · todos os casos são fictícios.</small>
    </MColumn>
    <MRow class="footer-bottom" data-mavis-flow :style="flowStyle('row')">
      <MText
        data-mavis-text
        as="span"
        variant="caption"
        tone="text"
        :style="textStyle('caption', 'text')"
        >© 2026 Lume</MText
      ><MText
        data-mavis-text
        as="span"
        variant="caption"
        tone="text"
        :style="textStyle('caption', 'text')"
        >Gentileza gera gentileza.</MText
      >
    </MRow>
  </footer>
</template>
