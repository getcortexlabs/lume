<script setup lang="ts">
import { MSpan } from "@getcortexlabs/mavis-web";
import { useEntrance } from "../../../shared/motion/enter";
const vEnter = useEntrance();
const entrances = Array.from({ length: 4 }, (_, index) => ({
  transition: { duration: 560, delay: index * 65 },
}));
import { textStyle, flowStyle } from "../../../shared/ui/mavis-styles";
import { ref } from "vue";
import { MButton, MIcon, MRow, MText } from "@getcortexlabs/mavis-web";
import HeroSection from "../components/HeroSection.vue";
import CareJourney from "../components/CareJourney.vue";
import RegionFinder from "../components/RegionFinder.vue";
import MissionStatement from "../components/MissionStatement.vue";
import CaseCard from "../../cases/components/CaseCard.vue";
import { useCases } from "../../cases/composables/useCases";
const { data: records, error, refresh } = useCases(ref({}));
</script>
<template>
  <div class="home-experience">
    <HeroSection />
    <RegionFinder />
    <section id="recent-cases" class="wrap section-space recent-cases">
      <MRow class="section-heading" data-mavis-flow :style="flowStyle('row')">
        <div>
          <MText
            class="eyebrow"
            data-mavis-text
            as="span"
            variant="overline"
            tone="text"
            :style="textStyle('overline', 'text')"
            >01 — CADA PESSOA IMPORTA</MText
          >
          <MText
            as="h2"
            variant="title"
            data-mavis-text
            :style="textStyle('title')"
            >Um nome. Uma história.<MSpan emphasis="em">
              Alguém que faz falta.</MSpan
            ></MText
          >
        </div>
        <RouterLink to="/cases" class="text-link"
          >Ver todos os avisos <MIcon name="arrow-right" size="sm"
        /></RouterLink>
      </MRow>
      <MText
        class="section-description"
        data-mavis-text
        as="p"
        variant="body"
        tone="muted"
        :style="textStyle('body', 'muted')"
      >
        Leia o aviso completo. Uma informação que você reconhece pode ajudar.
      </MText>
      <div v-if="error" role="alert">
        {{ error }} <MButton text="Tentar novamente" @click="refresh" />
      </div>
      <div class="case-grid">
        <div
          v-for="(record, index) in records.slice(0, 4)"
          :key="record.id"
          class="case-item"
          v-enter="entrances[index]"
        >
          <CaseCard :record="record" />
        </div>
      </div>
      <MRow class="disclosure" data-mavis-flow :style="flowStyle('row')">
        <MIcon name="info" size="sm" /><MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >Os nomes e perfis desta demonstração são fictícios. Nenhum aviso
          corresponde a um caso real.</MText
        >
      </MRow>
    </section>
    <section class="care-section">
      <div class="wrap">
        <MRow class="section-heading" data-mavis-flow :style="flowStyle('row')">
          <div>
            <MText
              class="eyebrow"
              data-mavis-text
              as="span"
              variant="overline"
              tone="text"
              :style="textStyle('overline', 'text')"
              >02 — FAÇA PARTE</MText
            >
            <MText
              data-mavis-text
              as="h2"
              variant="title"
              tone="text"
              :style="textStyle('title', 'text')"
              >O próximo gesto pode ser seu.</MText
            >
          </div>
          <p>
            Ajudar começa com atenção.<br />Encontre uma forma de fazer parte.
          </p>
        </MRow>
        <CareJourney />
      </div>
    </section>
    <MissionStatement />
  </div>
</template>
