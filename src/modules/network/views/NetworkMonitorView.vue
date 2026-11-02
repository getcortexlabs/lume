<script setup lang="ts">
import {
  MColumn,
  MRow,
  MCard,
  MText,
  MButton,
  MBadge,
} from "@getcortexlabs/mavis-web";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import PartnerPreview from "../components/PartnerPreview.vue";
import { useNetworkMonitor } from "../composables/useNetworkMonitor";
const {
  data,
  error,
  refresh,
  selected,
  current,
  active,
  visible,
  index,
  busy,
  actionError,
  run,
} = useNetworkMonitor();
const states = [
  { value: "connected", label: "Conectado" },
  { value: "offline", label: "Sem conexão" },
  { value: "error", label: "Falha de atualização" },
];
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">OPERAÇÃO DA REDE · SIMULAÇÃO</p>
      <h1>Cuidado que chega<br />a cada espaço.</h1>
      <p>
        Parceiros fictícios. Acompanhe versões, falhas e retirada das cópias
        nesta sessão.
      </p>
    </div>
    <div v-if="error" role="alert">
      {{ error }}<MButton text="Tentar novamente" @click="refresh" />
    </div>
    <div class="partner-grid">
      <MCard v-for="partner in data" :key="partner.id" padding="lg" gap="md"
        ><MBadge
          :text="
            states.find((s) => s.value === partner.connection)?.label ?? ''
          " /><MText as="h2" variant="heading">{{ partner.name }}</MText
        ><MText
          >{{ partner.city }} ·
          {{ partner.format === "screen" ? "Tela" : "Site" }}</MText
        ><MText variant="caption"
          >{{ partner.deliveries.filter((d) => d.snapshot).length }} avisos em
          exibição · {{ partner.pending }} atualizações pendentes</MText
        ><MButton
          :text="`Inspecionar ${partner.name}`"
          variant="secondary"
          @click="
            selected = partner.id;
            index = 0;
          "
      /></MCard>
    </div>
    <div v-if="current" class="network-layout workspace-links">
      <MColumn gap="lg" class="network-config">
        <MText as="h2" variant="title">{{ current.name }}</MText>
        <AppSelect
          id="partner-connection"
          label="Simular conexão"
          :model-value="current.connection"
          :options="states"
          @update:model-value="run('connection', $event)"
        />
        <MRow gap="sm" wrap
          ><MButton
            text="Revalidar canal"
            :loading="busy"
            @click="run('retry')" /><MButton
            text="Simular validade expirada"
            variant="secondary"
            :disabled="busy"
            @click="run('expire')"
        /></MRow>
        <MText v-if="actionError" role="alert">{{ actionError }}</MText>
        <MText variant="caption" tone="muted"
          >Cópias expiram em até cinco minutos sem revalidação. Ao reconectar, o
          canal consulta as versões atuais. Retirada não significa localização
          confirmada.</MText
        >
        <MText as="h3" variant="heading">Histórico do canal</MText>
        <MText v-if="!current.history.length" variant="caption"
          >Aguardando primeira sincronização.</MText
        >
        <MCard
          v-for="(event, position) in current.history"
          :key="position"
          padding="md"
          gap="sm"
          ><MText>{{ event.message }}</MText
          ><MText variant="caption">{{
            new Date(event.at).toLocaleString("pt-BR")
          }}</MText></MCard
        >
      </MColumn>
      <PartnerPreview
        :record="active"
        :mode="current.format"
        :has-next="visible.length > 1"
        @next="index++"
      />
    </div>
  </section>
</template>
