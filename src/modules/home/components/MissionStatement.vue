<script setup lang="ts">
import { MThemeProvider } from "@getcortexlabs/mavis-web";
import { lumeNightTheme } from "../../../app/theme";
import { useAccessibleTheme } from "../../preferences/composables/useAccessibleTheme";
const accessibleNightTheme = useAccessibleTheme(lumeNightTheme);
import { MBox, MIcon, MLink, MText } from "@getcortexlabs/mavis-web";
import { textStyle } from "../../../shared/ui/mavis-styles";
import { useKindnessMotion } from "../composables/useKindnessMotion";
const region = useKindnessMotion();
</script>
<template>
  <MThemeProvider :theme="accessibleNightTheme" appearance="dark">
    <section class="mission-section" aria-labelledby="kindness-title">
      <MBox :motion-region="region" :style="{ display: 'block' }">
        <div class="wrap">
          <div class="mission-heading">
            <MText
              class="eyebrow"
              data-mavis-text
              variant="overline"
              :style="textStyle('overline')"
              >UMA IDEIA SIMPLES. UM COMPROMISSO DIÁRIO.</MText
            >
            <p>
              Por trás de cada aviso, existe uma história. E alguém que faz
              falta.
            </p>
          </div>
          <h2 id="kindness-title" class="kindness-title">
            <span class="kindness-line" data-kindness-line>Gentileza</span>
            <span class="kindness-line indented" data-kindness-line
              >gera gentileza.</span
            >
          </h2>
          <div class="mission-bottom">
            <RouterLink to="/network" custom v-slot="{ href, navigate }">
              <MLink
                :href="href"
                :navigate="() => navigate()"
                text="Faça parte dessa rede"
              />
            </RouterLink>
            <span>TECNOLOGIA PARA APROXIMAR PESSOAS.</span>
          </div>
        </div>
        <div class="mission-ribbon" aria-hidden="true">
          <div class="mission-ribbon-copy" data-kindness-ribbon>
            <template v-for="index in 4" :key="index"
              ><span>Um olhar pode mudar uma história.</span
              ><i><MIcon name="arrow-up-right" :size="30" /></i
            ></template>
          </div>
        </div>
      </MBox>
    </section>
  </MThemeProvider>
</template>
