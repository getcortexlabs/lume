<script setup lang="ts">
import { textStyle, flowStyle } from "../../../shared/ui/mavis-styles";
import {
  MBox,
  MButton,
  MStack,
  MIcon,
  MRow,
  MText,
} from "@getcortexlabs/mavis-web";
import { useHeroMotion } from "../composables/useHeroMotion";
const heroRegion = useHeroMotion();
import ConnectionArtwork from "./ConnectionArtwork.vue";
</script>

<template>
  <section class="hero-stage" aria-labelledby="hero-title">
    <div class="hero wrap">
      <MBox
        class="hero-copy"
        :motion-region="heroRegion"
        :style="{ display: 'block' }"
      >
        <div data-hero-beat>
          <span class="eyebrow"
            ><span class="light-dot"></span> GENTILEZA GERA GENTILEZA</span
          >
        </div>
        <h1
          id="hero-title"
          class="hero-title"
          aria-label="Toda busca merece uma luz."
        >
          <span
            v-for="line in ['Toda busca', 'merece', 'uma luz.']"
            :key="line"
            class="hero-line"
            ><span data-hero-beat
              ><MText
                as="span"
                :style="{
                  font: 'inherit',
                  color: 'inherit',
                  display: 'block',
                  letterSpacing: 'inherit',
                }"
                >{{ line }}</MText
              ></span
            ></span
          >
          <svg
            class="hero-underline"
            viewBox="0 0 560 30"
            fill="none"
            aria-hidden="true"
          >
            <path
              data-hero-stroke
              d="M4 21C132 3 353 5 552 14"
              stroke="currentColor"
              stroke-width="7"
              stroke-linecap="round"
            />
          </svg>
        </h1>
        <div data-hero-beat class="hero-description">
          <p>
            Avisos de pessoas desaparecidas, reunidos para chegar a mais gente.
            Comece pela sua região.
          </p>
        </div>
        <div data-hero-beat>
          <MStack
            class="hero-actions"
            direction="row"
            wrap
            align="center"
            gap="lg"
          >
            <RouterLink to="/cases" custom v-slot="{ href, navigate }">
              <MButton
                class="hero-primary"
                :href="href"
                :navigate="() => navigate()"
                text="Encontrar avisos"
                trailing-icon="arrow-up-right"
                size="lg"
              />
            </RouterLink>
            <RouterLink to="/network" custom v-slot="{ href, navigate }">
              <MButton
                class="hero-secondary"
                :href="href"
                :navigate="() => navigate()"
                text="Quero fazer parte"
                trailing-icon="arrow-right"
                variant="ghost"
              />
            </RouterLink>
          </MStack>
        </div>
        <div data-hero-beat>
          <MRow class="hero-footnote" data-mavis-flow :style="flowStyle('row')">
            <MIcon name="shield-check" size="sm" /><MText
              data-mavis-text
              as="span"
              variant="caption"
              tone="text"
              :style="textStyle('caption', 'text')"
              >Informação com origem. Divulgação com cuidado.</MText
            >
          </MRow>
        </div>
      </MBox>
      <ConnectionArtwork />
      <MRow class="hero-baseline" data-mavis-flow :style="flowStyle('row')">
        <MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >PESSOAS DESAPARECIDAS · REDE DE APOIO</MText
        ><a href="#recent-cases"
          >Conheça os avisos <MIcon name="arrow-down" size="sm" /></a
        ><MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >OLHAR. RECONHECER. AJUDAR.</MText
        >
      </MRow>
    </div>
  </section>
</template>
