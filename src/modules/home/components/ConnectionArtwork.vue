<script setup lang="ts">
import { MThemeProvider } from "@getcortexlabs/mavis-web";
import { lumeNightTheme } from "../../../app/theme";
import { useAccessibleTheme } from "../../preferences/composables/useAccessibleTheme";
const accessibleNightTheme = useAccessibleTheme(lumeNightTheme);
import { useClientReady } from "../../../shared/composables/useClientReady";
const clientReady = useClientReady();
import { textStyle, flowStyle } from "../../../shared/ui/mavis-styles";
import { computed, ref } from "vue";
import {
  MLink,
  MIcon,
  MRow,
  MText,
  MButton,
  MCard,
  MBox,
} from "@getcortexlabs/mavis-web";
import { useConnectionMotion } from "../composables/useConnectionMotion";
import BrandSymbol from "../../../shared/components/BrandSymbol.vue";
const cities = [
  {
    name: "São Paulo",
    className: "city-sp",
    caption: "O cuidado começa perto.",
  },
  {
    name: "Suzano",
    className: "city-suzano",
    caption: "Mais olhares. Novos caminhos.",
  },
  {
    name: "Guarulhos",
    className: "city-guarulhos",
    caption: "Uma comunidade pode aproximar.",
  },
];
const selected = ref("São Paulo");
const { surface, region } = useConnectionMotion(selected);
const active = computed(() =>
  cities.find((city) => city.name === selected.value)!,
);
</script>

<template>
  <MThemeProvider :theme="accessibleNightTheme" appearance="dark">
    <MBox
      class="light-network"
      :data-city="selected"
      :motion-region="region"
      :style="{ display: 'flex', flexDirection: 'column' }"
    >
      <MText
        class="network-eyebrow"
        data-mavis-text
        as="span"
        variant="caption"
        tone="text"
        :style="textStyle('caption', 'text')"
        >A GENTILEZA ENCONTRA CAMINHO.</MText
      >
      <MBox class="network-scene" :style="{ display: 'block' }">
        <div class="orbit-field" aria-hidden="true">
          <svg
            class="light-orbits"
            viewBox="0 0 600 540"
            fill="none"
            aria-hidden="true"
          >
            <g stroke="#d5dfbc" stroke-opacity=".13" stroke-width="1">
              <path d="M-30 450C140 450 80 20 310 20S460 330 650 330" />
              <path d="M-30 480C165 480 100 45 310 45S440 360 650 360" />
              <path d="M-30 510C190 510 120 70 310 70S420 390 650 390" />
            </g>
            <g
              class="network-traces"
              stroke="#c7ee8e"
              stroke-opacity=".13"
              stroke-width="1"
            >
              <path d="M300 260C205 260 220 165 128 165" />
              <path d="M300 260C380 260 390 139 468 139" />
              <path d="M300 260C300 330 368 332 418 390" />
            </g>
            <g
              class="network-signal"
              stroke="#d0ef88"
              stroke-width="3"
              stroke-linecap="round"
            >
              <path
                data-connection="São Paulo"
                d="M300 260C205 260 220 165 128 165"
              />
              <path
                data-connection="Suzano"
                d="M300 260C380 260 390 139 468 139"
              />
              <path
                data-connection="Guarulhos"
                d="M300 260C300 330 368 332 418 390"
              />
            </g>
            <g fill="#d4f6a0">
              <circle cx="128" cy="165" r="3" />
              <circle cx="468" cy="139" r="3" />
              <circle cx="418" cy="390" r="3" />
              <circle cx="104" cy="338" r="2" />
              <circle cx="328" cy="49" r="2" />
              <circle cx="483" cy="300" r="2" />
              <circle cx="214" cy="447" r="2" />
            </g>
          </svg>
        </div>
        <div class="lume-beacon" aria-hidden="true">
          <div class="beacon-aura"></div>
          <MCard
            class="beacon-glass"
            :motion-surface="surface"
            padding="none"
            :style="{
              background: '#d1ed91',
              border: '0',
              borderRadius: '2px',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
            }"
            ><BrandSymbol :size="96"
          /></MCard>
          <MText
            class="beacon-word"
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >lume</MText
          >
        </div>
        <div
          class="network-cities"
          role="group"
          aria-label="Explore os avisos por cidade"
        >
          <div
            v-for="city in cities"
            :key="city.name"
            class="city-anchor"
            :class="city.className"
            data-network-node
          >
            <MButton
              :disabled="!clientReady"
              class="network-city"
              :data-selected="selected === city.name"
              size="sm"
              variant="ghost"
              icon="map-pin"
              trailing-icon="arrow-up-right"
              :text="city.name"
              :aria-pressed="selected === city.name"
              :style="{
                backgroundColor: 'var(--city-surface)',
                color: 'var(--city-ink)',
                border: '1px solid var(--city-border)',
                padding: 'var(--city-padding, 12px 15px)',
                fontSize: 'var(--city-type-size, 12px)',
                minHeight: '44px',
                borderRadius: '2px',
              }"
              @click="selected = city.name"
            />
          </div>
        </div>
        <span class="network-annotation annotation-left">01 / VOCÊ</span
        ><span class="network-annotation annotation-right"
          >02 / SUA REGIÃO</span
        >
      </MBox>
      <MRow class="network-caption" data-mavis-flow :style="flowStyle('row')">
        <span class="caption-orbit"><MIcon name="radio" :size="19" /></span>
        <div class="network-caption-copy" aria-live="polite">
          <strong>{{ active.caption }}</strong
          ><RouterLink
            :to="{ path: '/cases', query: { city: selected } }"
            custom
            v-slot="{ href, navigate }"
          >
            <MLink
              :href="href"
              :navigate="() => navigate()"
              :text="`Ver avisos em ${selected}`"
              inline
            />
          </RouterLink>
        </div>
      </MRow>
      <MText
        class="network-disclaimer"
        data-mavis-text
        as="span"
        variant="caption"
        tone="text"
        :style="textStyle('caption', 'text')"
        >REDE ILUSTRATIVA · ESCOLHA UMA CIDADE PARA EXPLORAR</MText
      >
    </MBox>
  </MThemeProvider>
</template>

<style scoped>
.light-network {
  position: relative;
  min-width: 0;
  width: 100%;
  align-self: center;
  background: #203c31;
  color: #f5f2e8;
  padding: 28px 24px 22px;
  border-radius: 2px;
  box-shadow: 12px 12px 0 #dce5cd;
}
.network-eyebrow {
  --copy-color: #d9e5c9;
  --copy-size: 9px;
  --copy-tracking: 1.5px;
}
.network-scene {
  height: 360px;
  position: relative;
  width: 100%;
  isolation: isolate;
}
.orbit-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.light-orbits {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.lume-beacon {
  position: absolute;
  left: 50%;
  top: 47%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 12px;
}
.beacon-glass {
  width: 134px;
  height: 134px;
  display: grid;
  place-items: center;
}
.beacon-glass :deep(.brand-symbol) {
  filter: brightness(0);
  opacity: 0.85;
}
.beacon-word {
  --copy-size: 12px;
  --copy-weight: 500;
  --copy-tracking: 4px;
  --copy-color: #e1eccf;
}
.beacon-aura {
  position: absolute;
  width: 160px;
  height: 160px;
  left: -13px;
  top: -13px;
  border: 1px solid #d0ef8840;
  pointer-events: none;
}
.city-anchor {
  position: absolute;
}
.network-city {
  --city-surface: #203c31;
  --city-ink: #e4edd7;
  --city-border: #8fa486;
  --city-padding: 11px 13px;
  --city-type-size: 11px;
}
.network-city:hover,
.network-city[data-selected="true"] {
  --city-surface: #d1ed91;
  --city-ink: #203225;
  --city-border: #d1ed91;
}
.network-city:focus-visible {
  outline-color: #d1ed91;
}
.city-sp {
  left: -9px;
  top: 22%;
}
.city-suzano {
  right: -7px;
  top: 12%;
}
.city-guarulhos {
  right: 0;
  bottom: 12%;
}
.network-annotation {
  position: absolute;
  font-family: monospace;
  font-size: 9px;
  letter-spacing: 1px;
  color: #bdcfad;
}
.annotation-left {
  left: 0;
  bottom: 21%;
}
.annotation-right {
  right: -7px;
  top: 49%;
  writing-mode: vertical-rl;
}
.network-caption {
  --flow-gap: 14px;
  --flow-align: center;
  border-top: 1px solid #6e85634d;
  padding-top: 20px;
}
.caption-orbit {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid #a8c18b;
  border-radius: 50%;
  color: #d1ed91;
  flex-shrink: 0;
}
.network-caption-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.network-caption strong {
  font-size: 13px;
  font-weight: 500;
  color: #f3f3e9;
}
.network-disclaimer {
  --copy-size: 8px;
  --copy-color: #c3d1b4;
  --copy-tracking: 0.7px;
  margin-top: 22px;
}
@media (max-width: 1100px) {
  .light-network {
    padding: 24px 16px 20px;
  }
  .network-scene {
    height: 340px;
  }
  .network-city {
    --city-padding: 9px 8px;
    --city-type-size: 10px;
  }
  .beacon-glass {
    width: 115px;
    height: 115px;
  }
  .beacon-aura {
    width: 141px;
    height: 141px;
  }
}
@media (max-width: 760px) {
  .light-network {
    max-width: 480px;
    margin: 24px auto 10px;
    padding: 22px 20px;
    box-shadow: 7px 7px 0 #dce5cd;
  }
  .network-scene {
    height: 320px;
  }
  .network-eyebrow {
    --copy-size: 8px;
    --copy-tracking: 1px;
  }
  .network-city {
    --city-padding: 9px 7px;
  }
  .beacon-glass {
    width: 102px;
    height: 102px;
  }
  .beacon-glass :deep(.brand-symbol) {
    --symbol-size: 78px !important;
  }
  .beacon-aura {
    width: 128px;
    height: 128px;
  }
  .city-sp {
    left: -10px;
    top: 25%;
  }
  .city-suzano {
    right: -10px;
    top: 9%;
  }
  .network-disclaimer {
    --copy-size: 7px;
  }
}
</style>
