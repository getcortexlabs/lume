<script setup lang="ts">
import { computed } from "vue";
import { MColumn, MText } from "@getcortexlabs/mavis-web";
import PersonArtwork from "./PersonArtwork.vue";
import { formatDate, type PublicCase } from "../domain/case";
import { createPosterQr } from "../presentation/poster-qr";
const props = defineProps<{ record: PublicCase; url: string }>();
const qr = computed(() => createPosterQr(props.url));
</script>
<template>
  <article class="case-poster" aria-label="Cartaz de demonstração">
    <div class="poster-brand">
      <strong>lume</strong><span>Gentileza gera gentileza.</span>
    </div>
    <div class="poster-demo">
      DEMONSTRAÇÃO · PESSOA E AVISO FICTÍCIOS · NÃO É UMA BUSCA REAL
    </div>
    <div class="poster-body">
      <div class="poster-profile">
        <PersonArtwork
          :initials="record.initials"
          :color="record.color"
        /><small>Ilustração · pessoa fictícia</small>
      </div>
      <MColumn gap="md">
        <MText as="h1" variant="display">{{ record.name }}</MText>
        <MText>{{ record.age }} anos · {{ record.city }}, SP</MText>
        <MColumn gap="xs"
          ><MText variant="heading">Desaparecimento informado</MText
          ><MText>{{ formatDate(record.missingSince) }}</MText></MColumn
        >
        <MColumn gap="xs"
          ><MText variant="heading">Última região informada</MText
          ><MText>{{ record.neighborhood }}, {{ record.city }}</MText></MColumn
        >
      </MColumn>
    </div>
    <MColumn gap="md" class="poster-description">
      <MText>{{ record.description }}</MText>
      <MColumn gap="xs"
        ><MText variant="heading">Vestuário informado</MText
        ><MText>{{ record.clothing }}</MText></MColumn
      >
      <MColumn gap="xs"
        ><MText variant="caption">Origem: {{ record.source }}</MText
        ><MText variant="caption"
          >Divulgação revisada em {{ formatDate(record.reviewedAt) }} · versão
          {{ record.revision }}</MText
        ></MColumn
      >
    </MColumn>
    <div class="poster-current">
      <svg
        class="poster-qr"
        :viewBox="`0 0 ${qr.size} ${qr.size}`"
        role="img"
        aria-label="QR code para a página atual deste aviso"
        shape-rendering="crispEdges"
      >
        <rect width="100%" height="100%" fill="white" />
        <path :d="qr.path" fill="black" />
      </svg>
      <div>
        <strong>A informação precisa continuar atualizada.</strong>
        <p>
          Consulte a página antes de compartilhar. Um cartaz impresso não
          acompanha alterações ou retiradas.
        </p>
        <a :href="url">{{ url }}</a>
        <p class="poster-local">
          Nesta demonstração, um endereço localhost só funciona no dispositivo
          em que o Lume está aberto.
        </p>
      </div>
    </div>
  </article>
</template>
