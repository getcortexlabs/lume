<script setup lang="ts">
import { useCardEmphasis } from "../../../shared/motion/useCardEmphasis";
const { surface, events } = useCardEmphasis();
import {
  textStyle,
  flowStyle,
  cardStyle,
} from "../../../shared/ui/mavis-styles";
import { MColumn, MIcon, MText, MCard, MBox } from "@getcortexlabs/mavis-web";
import type { LocationQueryRaw } from "vue-router";
import type { PublicCase } from "../domain/case";
import { formatDate } from "../domain/case";
import PersonArtwork from "./PersonArtwork.vue";
defineProps<{ record: PublicCase; searchContext?: LocationQueryRaw }>();
</script>
<template>
  <RouterLink
    :to="{ path: `/cases/${record.id}`, query: searchContext }"
    custom
    v-slot="{ href, navigate }"
    ><MCard
      class="case-card case-link"
      :motion-surface="surface"
      v-on="events"
      :href="href"
      :navigate="() => navigate()"
      data-mavis-card
      padding="none"
      radius="md"
      :style="cardStyle"
      ><MBox class="case-image">
        <PersonArtwork
          :initials="record.initials"
          :color="record.color"
        /><MText
          class="case-demo"
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >Exemplo fictício</MText
        ><span class="case-arrow"
          ><MIcon name="arrow-up-right" size="sm"
        /></span>
      </MBox>
      <MColumn
        class="case-card-body"
        data-mavis-flow
        :style="flowStyle('column')"
      >
        <span class="case-location"
          ><MIcon name="map-pin" size="sm" /> {{ record.city }}, SP</span
        >
        <MText
          data-mavis-text
          as="h3"
          variant="heading"
          tone="text"
          :style="textStyle('heading', 'text')"
          >{{ record.name }}</MText
        >
        <MText
          as="p"
          variant="caption"
          tone="muted"
          data-mavis-text
          :style="textStyle('caption', 'muted')"
          >{{ record.age }} anos · {{ record.neighborhood }}</MText
        >
        <div class="case-date">
          Desaparecimento informado em
          <strong>{{ formatDate(record.missingSince) }}</strong>
        </div>
      </MColumn></MCard
    ></RouterLink
  >
</template>
