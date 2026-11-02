<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { MColumn, MRow, MCard, MText } from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { displayCities, displayIntervals } from "../domain/display";
import { useWorkspace } from "../../workspaces/composables/useWorkspace";
const { state } = useWorkspace();
const city = ref(""),
  interval = ref("12"),
  origin = ref("");
onMounted(() => (origin.value = window.location.origin));
const query = computed(() => ({
  city: city.value,
  interval: interval.value,
  organization: state.value.organization.id,
}));
const code = computed(
  () =>
    `<iframe src="${origin.value}/embed?${new URLSearchParams(query.value)}" title="Avisos fictícios do Lume" width="100%" height="900" loading="lazy"></iframe>`,
);
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">MAIS LUGARES PARA O CUIDADO</p>
      <h1>Leve a atenção<br />um pouco mais longe.</h1>
      <p>
        Um widget para sites e uma tela de divulgação. Configure a região,
        experimente a rotação e confira a expiração dos avisos.
      </p>
    </div>
    <MCard padding="lg" gap="lg"
      ><AppSelect
        id="display-city"
        label="Região de divulgação"
        v-model="city"
        :options="[
          { value: '', label: 'Todas as regiões' },
          ...displayCities.map((value) => ({ value, label: value })),
        ]"
      /><AppSelect
        id="display-interval"
        label="Tempo de cada aviso"
        v-model="interval"
        :options="
          displayIntervals.map((value) => ({
            value: String(value),
            label: `${value} segundos`,
          }))
        "
      /><MRow gap="lg" wrap
        ><RouterLink :to="{ path: '/embed', query }" class="button-link"
          >Abrir widget</RouterLink
        ><RouterLink :to="{ path: '/screen', query }" class="button-link"
          >Abrir modo de tela</RouterLink
        ></MRow
      ></MCard
    ><MColumn gap="md" class="embed-note"
      ><MText as="h2" variant="heading">Experimente em outra página</MText
      ><MText
        >O endereço carrega os exemplos da organização escolhida. Publicações e
        retiradas de outra aba ainda não sincronizam: cada instância tem sua
        própria simulação. Nenhuma integração externa está ativa.</MText
      >
      <pre v-if="origin" aria-label="Código de incorporação">{{ code }}</pre>
      <MText variant="caption"
        >Validade de 60 segundos, consulta a cada 20 segundos. Sem revalidação,
        os dados desaparecem. Movimento reduzido inicia com a rotação
        pausada.</MText
      ></MColumn
    >
  </section>
</template>
<style scoped>
.embed-note {
  margin-top: 32px;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: #eef2e7;
  padding: 24px;
  border-radius: 16px;
  font-size: 13px;
}
</style>
