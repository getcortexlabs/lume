<script setup lang="ts">
import { MReveal } from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { textStyle, flowStyle } from "../../../shared/ui/mavis-styles";
import { cityOptions } from "../../cases/presentation/choices";
import { ref, computed } from "vue";
import {
  MButton,
  MColumn,
  MIcon,
  MRow,
  MText,
  MSegmentedControl,
} from "@getcortexlabs/mavis-web";
import { useCases } from "../../cases/composables/useCases";
import PartnerPreview from "../components/PartnerPreview.vue";
import { useClipboard } from "../../../shared/composables/useClipboard";
import { useClientReady } from "../../../shared/composables/useClientReady";
const ready = useClientReady();
const city = ref(""),
  mode = ref("widget"),
  selected = ref(0);
const configOpen = ref(false);
const { data: records } = useCases(computed(() => ({ city: city.value })));
const active = computed(
  () => records.value[selected.value % (records.value.length || 1)],
);
const config = computed(() =>
  JSON.stringify(
    {
      region: city.value || "Todas as cidades",
      format: mode.value,
      status: "demonstracao",
    },
    null,
    2,
  ),
);
const { message: copied, copy: copyText } = useClipboard();
function copy() {
  return copyText(config.value, "Configuração de demonstração copiada.");
}
</script>
<template>
  <section class="wrap page-section">
    <MColumn class="page-heading" data-mavis-flow :style="flowStyle('column')">
      <MText
        class="eyebrow"
        data-mavis-text
        as="span"
        variant="overline"
        tone="text"
        :style="textStyle('overline', 'text')"
        >REDE DE CUIDADO</MText
      >
      <h1>Seu espaço pode ser<br />um ponto de encontro.</h1>
      <MText
        data-mavis-text
        as="p"
        variant="body"
        tone="muted"
        :style="textStyle('body', 'muted')"
      >
        Um site, uma loja, uma tela. Mais lugares para uma informação chegar a
        quem pode ajudar.
      </MText>
    </MColumn>
    <RouterLink to="/organization/network" class="text-link workspace-links"
      >Explorar operação dos parceiros fictícios →</RouterLink
    >
    <div class="network-layout">
      <MColumn
        class="network-config"
        data-mavis-flow
        :style="flowStyle('column')"
      >
        <MText
          class="eyebrow"
          data-mavis-text
          as="span"
          variant="overline"
          tone="text"
          :style="textStyle('overline', 'text')"
          >EXPLORE A EXPERIÊNCIA</MText
        >
        <MText
          data-mavis-text
          as="h2"
          variant="title"
          tone="text"
          :style="textStyle('title', 'text')"
          >Veja o Lume no seu espaço.</MText
        >
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
        >
          Configure uma prévia com os avisos fictícios disponíveis. As retiradas
          feitas na área da organização também aparecem aqui.
        </MText>
        <AppSelect
          id="network-city"
          label="Região de divulgação"
          v-model="city"
          :options="cityOptions"
          @change="selected = 0"
        />
        <MSegmentedControl
          label="Formato de exibição"
          :model-value="mode"
          :options="[
            { value: 'widget', label: 'Site / widget' },
            { value: 'screen', label: 'Tela' },
          ]"
          @update:model-value="
            (value) => {
              if (typeof value === 'string') mode = value;
            }
          "
        />
        <MRow class="network-benefit" data-mavis-flow :style="flowStyle('row')">
          <MIcon name="refresh-cw" />
          <div>
            <strong>Uma publicação, uma versão atual.</strong>
            <MText
              data-mavis-text
              as="p"
              variant="body"
              tone="muted"
              :style="textStyle('body', 'muted')"
              >A prévia usa a mesma informação disponível no site.</MText
            >
          </div>
        </MRow>
        <MButton
          text="Copiar configuração de exemplo"
          icon="copy"
          variant="secondary"
          @click="copy"
        />
        <MText
          v-if="copied"
          role="status"
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >{{ copied }}</MText
        >
        <MButton
          variant="ghost"
          size="sm"
          :text="configOpen ? 'Ocultar configuração' : 'Ver configuração'"
          :trailing-icon="configOpen ? 'chevron-up' : 'chevron-down'"
          :aria-expanded="configOpen"
          :disabled="!ready"
          aria-controls="network-config-details"
          @click="configOpen = !configOpen"
        />
        <MReveal
          :show="configOpen"
          id="network-config-details"
          class="config-details"
        >
          <pre>{{ config }}</pre>
        </MReveal>
        <MText
          class="small muted"
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
        >
          Prévia local. A incorporação em sites e a sincronização entre
          dispositivos entram na integração futura.
        </MText>
      </MColumn>
      <PartnerPreview
        :record="active"
        :mode="mode"
        :has-next="records.length > 1"
        @next="selected++"
      />
    </div>
  </section>
</template>
