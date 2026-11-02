<script setup lang="ts">
import { useClientReady } from "../../../shared/composables/useClientReady";
const clientReady = useClientReady();
import {
  textStyle,
  flowStyle,
  cardStyle,
} from "../../../shared/ui/mavis-styles";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  MButton,
  MCard,
  MColumn,
  MIcon,
  MRow,
  MText,
} from "@getcortexlabs/mavis-web";
import { useCaseDetail } from "../composables/useCaseDetail";
import { caseSearchQuery, readCaseSearch } from "../presentation/search-state";
import CaseNeighbors from "../components/CaseNeighbors.vue";
import ShareCaseSheet from "../components/ShareCaseSheet.vue";
import { formatDate } from "../domain/case";
import PersonArtwork from "../components/PersonArtwork.vue";
import ContactDialog from "../components/ContactDialog.vue";
const route = useRoute();
const {
  data: record,
  state,
  loading,
  error,
  refresh,
} = useCaseDetail(computed(() => String(route.params.id)));
const contactOpen = ref(false),
  shareOpen = ref(false),
  shareUrl = ref("");
const searchContext = computed(() =>
  caseSearchQuery(readCaseSearch(route.query)),
);
const backLabel = computed(() =>
  Object.keys(searchContext.value).length
    ? "Voltar para minha busca"
    : "Voltar para os avisos",
);
function focusTrigger(event: MouseEvent) {
  event.preventDefault();
  (event.currentTarget as HTMLElement | null)?.focus({preventScroll: true});
}
function contact() {
  contactOpen.value = true;
}
function share() {
  if (!record.value) return;
  // Explicit canonical path: search text and other URL parameters never enter the shared link.
  shareUrl.value = new URL(
    `/cases/${encodeURIComponent(record.value.id)}`,
    window.location.origin,
  ).href;
  shareOpen.value = true;
}
watch([() => route.params.id, () => record.value?.id], () => {
  contactOpen.value = false;
  shareOpen.value = false;
  shareUrl.value = "";
});
</script>
<template>
  <section class="wrap page-section">
    <RouterLink class="back-link" :to="{ path: '/cases', query: searchContext }"
      ><MIcon name="arrow-left" size="sm" /> {{ backLabel }}</RouterLink
    >
    <MText
      v-if="loading"
      role="status"
      data-mavis-text
      as="p"
      variant="body"
      tone="muted"
      :style="textStyle('body', 'muted')"
      >Carregando aviso…</MText
    >
    <div v-else-if="error" role="alert">
      {{ error }} <MButton text="Tentar novamente" @click="refresh" />
    </div>
    <div v-else-if="!record" class="empty-state">
      <MIcon name="shield-check" :size="36" />
      <MText
        data-mavis-text
        as="h1"
        variant="display"
        tone="text"
        :style="textStyle('display', 'text')"
        >{{
          state === "withdrawn"
            ? "A divulgação deste aviso foi retirada."
            : "Este aviso não está disponível."
        }}</MText
      >
      <MText
        data-mavis-text
        as="p"
        variant="body"
        tone="muted"
        :style="textStyle('body', 'muted')"
      >
        A publicação pode ter sido retirada. Isso, por si só, não informa a
        situação da pessoa.
      </MText>
      <RouterLink to="/cases" class="button-link"
        >Consultar outros avisos</RouterLink
      >
    </div>
    <div v-else class="detail-layout">
      <MColumn
        class="detail-portrait"
        data-mavis-flow
        :style="flowStyle('column')"
      >
        <PersonArtwork :initials="record.initials" :color="record.color" />
        <MRow
          class="portrait-caption"
          data-mavis-flow
          :style="flowStyle('row')"
        >
          <MIcon name="info" size="sm" /> Perfil ilustrativo. Pessoa fictícia.
        </MRow>
        <MCard
          class="source-card"
          data-mavis-card
          padding="none"
          radius="md"
          :style="cardStyle"
        >
          <MText
            class="eyebrow"
            data-mavis-text
            as="span"
            variant="overline"
            tone="text"
            :style="textStyle('overline', 'text')"
            >ORIGEM DA INFORMAÇÃO</MText
          >
          <MText
            data-mavis-text
            as="h3"
            variant="heading"
            tone="text"
            :style="textStyle('heading', 'text')"
            >{{ record.source }}</MText
          >
          <MText
            data-mavis-text
            as="p"
            variant="body"
            tone="muted"
            :style="textStyle('body', 'muted')"
            >Divulgação revisada em {{ formatDate(record.reviewedAt) }}.</MText
          >
          <span class="source-status"
            ><span class="status-dot"></span> Versão pública
            {{ record.revision }}</span
          >
        </MCard>
      </MColumn>
      <MColumn
        class="detail-content"
        data-mavis-flow
        :style="flowStyle('column')"
      >
        <MText
          class="pill"
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >AVISO DE DEMONSTRAÇÃO</MText
        >
        <MText
          data-mavis-text
          as="h1"
          variant="display"
          tone="text"
          :style="textStyle('display', 'text')"
          >{{ record.name }}</MText
        >
        <p class="detail-subtitle">
          {{ record.age }} anos
          <MText
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >·</MText
          >
          {{ record.city }}, SP
        </p>
        <MColumn
          class="detail-facts"
          data-mavis-flow
          :style="flowStyle('column')"
        >
          <div>
            <MIcon name="calendar-days" /><span
              >Desaparecimento informado<strong>{{
                formatDate(record.missingSince)
              }}</strong></span
            >
          </div>
          <div>
            <MIcon name="map-pin" /><span
              >Última região informada<strong
                >{{ record.neighborhood }}, {{ record.city }}</strong
              ></span
            >
          </div>
        </MColumn>
        <MText
          data-mavis-text
          as="h2"
          variant="title"
          tone="text"
          :style="textStyle('title', 'text')"
          >Informações do aviso</MText
        >
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >{{ record.description }}</MText
        >
        <MText
          data-mavis-text
          as="h3"
          variant="heading"
          tone="text"
          :style="textStyle('heading', 'text')"
          >Vestuário informado</MText
        >
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >{{ record.clothing }}</MText
        >
        <MRow class="detail-actions" data-mavis-flow :style="flowStyle('row')">
          <MButton
            :disabled="!clientReady"
            text="Tenho uma informação"
            icon="message-circle"
            @mousedown="focusTrigger"
            @click="contact"
          /><MButton
            :disabled="!clientReady"
            text="Compartilhar aviso"
            icon="share-2"
            variant="secondary"
            @mousedown="focusTrigger"
            @click="share"
          />
          <RouterLink :to="`/cases/${record.id}/poster`" class="text-link"
            >Preparar cartaz</RouterLink
          >
        </MRow>
        <MRow class="privacy-note" data-mavis-flow :style="flowStyle('row')">
          <MIcon name="lock-keyhole" size="sm" />
          <MText
            data-mavis-text
            as="p"
            variant="body"
            tone="muted"
            :style="textStyle('body', 'muted')"
          >
            Informações sobre avistamentos devem chegar à equipe responsável por
            um canal reservado. Cuidado também é proteger a privacidade.
          </MText>
        </MRow>
      </MColumn>
    </div>
    <CaseNeighbors v-if="record" :id="record.id" :context="searchContext" />
    <ContactDialog
      :open="contactOpen && !!record"
      @close="contactOpen = false"
    />
    <ShareCaseSheet
      v-if="record"
      :key="record.id"
      :open="shareOpen"
      :record="record"
      :url="shareUrl"
      @close="shareOpen = false"
    />
  </section>
</template>
