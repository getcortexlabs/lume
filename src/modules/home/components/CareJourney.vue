<script setup lang="ts">
import {
  MCard,
  MIcon,
  MStack,
  MText,
  type IconName,
} from "@getcortexlabs/mavis-web";
import { useEntrance } from "../../../shared/motion/enter";
import { useCardEmphasis } from "../../../shared/motion/useCardEmphasis";
const vEnter = useEntrance();
const interactions = Array.from({ length: 3 }, () => useCardEmphasis());
const entrances = Array.from({ length: 3 }, (_, index) => ({
  transition: { duration: 540, delay: index * 80 },
}));
const steps: {
  title: string;
  description: string;
  action: string;
  path: string;
  icon: IconName;
}[] = [
  {
    title: "Olhe com atenção",
    description:
      "Conheça os avisos da sua região e consulte as informações de cada caso.",
    action: "Encontrar avisos",
    path: "/cases",
    icon: "scan-eye",
  },
  {
    title: "Amplie o alcance",
    description:
      "Seu site ou estabelecimento pode ajudar informações a chegar mais longe.",
    action: "Conhecer a rede",
    path: "/network",
    icon: "radio",
  },
  {
    title: "Encontre orientação",
    description:
      "Se alguém desapareceu, saiba como organizar as informações e procurar ajuda.",
    action: "Por onde começar",
    path: "/guidance",
    icon: "heart-handshake",
  },
];
</script>
<template>
  <MStack class="care-grid" direction="row" wrap gap="xl" align="stretch">
    <div
      v-for="(step, index) in steps"
      :key="step.path"
      class="care-step"
      v-enter="entrances[index]"
    >
      <RouterLink :to="step.path" custom v-slot="{ href, navigate }">
        <MCard
          class="care-card"
          :motion-surface="interactions[index]!.surface"
          v-on="interactions[index]!.events"
          :href="href"
          :navigate="() => navigate()"
          padding="none"
          radius="none"
          :style="{
            background: '#edf2e1',
            border: 0,
            borderTop: '2px solid #6e854c',
            padding: '28px 24px 24px',
            height: '100%',
          }"
        >
          <MIcon :name="step.icon" :size="28" />
          <MText
            class="step-number"
            :style="{
              color: '#607543',
              fontFamily: 'var(--serif)',
              fontSize: '40px',
            }"
            >0{{ index + 1 }}</MText
          >
          <MText as="h3" variant="heading" :style="{ margin: '30px 0 12px' }">{{
            step.title
          }}</MText>
          <MText
            as="p"
            tone="muted"
            :style="{ fontSize: '13px', lineHeight: 1.7 }"
            >{{ step.description }}</MText
          >
          <span class="text-link"
            >{{ step.action }} <MIcon name="arrow-right" size="sm"
          /></span>
        </MCard>
      </RouterLink>
    </div>
  </MStack>
</template>
<style scoped>
.care-step {
  flex: 1 1 260px;
  min-width: min(100%, 260px);
}
.care-card .text-link {
  margin-top: auto;
  padding-top: 16px;
}
</style>
