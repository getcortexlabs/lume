<script setup lang="ts">
import { MReveal } from "@getcortexlabs/mavis-web";
import {
  MColumn,
  MRow,
  MCard,
  MText,
  MButton,
  MBadge,
} from "@getcortexlabs/mavis-web";
import { useContentTransition } from "../../../shared/motion/useContentTransition";
const transition = useContentTransition();
import BrandLogo from "../../../shared/components/BrandLogo.vue";
import PersonArtwork from "../../cases/components/PersonArtwork.vue";
import { formatDate } from "../../cases/domain/case";
import { useDisplay } from "../composables/useDisplay";
defineProps<{ mode: "widget" | "screen" }>();
const {
  settings,
  current,
  records,
  index,
  paused,
  offline,
  error,
  seconds,
  loading,
  testing,
  refresh,
  next,
  togglePause,
  setOffline,
  expire,
} = useDisplay();
</script>
<template>
  <section class="display-shell" :class="`display-${mode}`">
    <header class="display-header">
      <BrandLogo /><MBadge text="Demonstração · pessoas fictícias" />
    </header>
    <MColumn gap="lg"
      ><div>
        <p class="eyebrow">{{ settings.city || "TODAS AS REGIÕES" }}</p>
        <h1>Gentileza gera gentileza.</h1>
        <p>Um instante de atenção pode fazer a diferença.</p>
      </div>
      <Transition v-bind="transition"
        ><div :key="current ? `${current.id}:${current.revision}` : 'empty'">
          <MCard v-if="current" class="display-person" padding="none"
            ><div class="display-art">
              <PersonArtwork
                :initials="current.initials"
                :color="current.color"
              />
            </div>
            <MColumn gap="md" class="display-information"
              ><MBadge text="Aviso fictício" /><MText as="h2" variant="title">{{
                current.name
              }}</MText
              ><MText>{{ current.age }} anos · {{ current.city }}</MText
              ><MText>{{ current.neighborhood }}</MText
              ><MText variant="caption"
                >Desaparecimento informado em
                {{ formatDate(current.missingSince) }}</MText
              ><MText variant="caption"
                >{{ current.source }} · revisão {{ current.revision }}</MText
              ><RouterLink :to="`/cases/${current.id}`" class="button-link"
                >Consultar aviso</RouterLink
              ></MColumn
            ></MCard
          ><MCard v-else key="empty" padding="lg" gap="md"
            ><MText as="h2" variant="heading">{{
              loading ? "Consultando avisos…" : "Nenhum aviso em exibição"
            }}</MText
            ><MText>{{
              error || "Não há publicações disponíveis para esta região."
            }}</MText></MCard
          >
        </div></Transition
      >
      <MRow gap="md" wrap
        ><MButton
          :text="paused ? 'Iniciar rotação' : 'Pausar rotação'"
          variant="secondary"
          :disabled="records.length < 2"
          @click="togglePause"
        /><MButton
          text="Próximo aviso"
          variant="ghost"
          :disabled="records.length < 2"
          @click="next"
        /><MText variant="caption"
          >{{ current ? index + 1 : 0 }} de {{ records.length }} ·
          {{ offline ? "Sem conexão" : "Conectado" }} · validade
          {{ seconds }}s</MText
        ></MRow
      >
      <MText v-if="error && current" role="status">{{ error }}</MText
      ><MButton
        text="Testar funcionamento"
        variant="ghost"
        :aria-expanded="testing"
        @click="testing = !testing" /><MReveal :show="testing"
        ><MColumn gap="md"
          ><MText variant="caption"
            >Nesta demonstração, mudanças sincronizam dentro desta aba. Outra
            aba ou dispositivo inicia seus próprios exemplos.</MText
          ><MRow gap="md" wrap
            ><MButton
              :text="offline ? 'Reconectar demonstração' : 'Simular offline'"
              variant="secondary"
              @click="setOffline(!offline)" /><MButton
              text="Expirar cópia"
              variant="ghost"
              @click="expire" /><MButton
              text="Consultar novamente"
              :disabled="offline || loading"
              variant="ghost"
              @click="refresh" /></MRow></MColumn></MReveal
    ></MColumn>
  </section>
</template>
<style scoped>
.display-shell {
  width: 100%;
  box-sizing: border-box;
  max-width: 1180px;
  margin: auto;
  padding: clamp(20px, 4vw, 64px);
  min-height: 100vh;
  background: var(--paper, #fafbf6);
}
.display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.display-shell h1 {
  font-family: Georgia, serif;
  font-size: clamp(30px, 4vw, 60px);
  line-height: 1.12;
  margin: 8px 0 16px;
  font-weight: 400;
}
.display-person {
  display: grid !important;
  grid-template-columns: minmax(180px, 0.85fr) 1.15fr;
  overflow: hidden;
}
.display-art {
  min-height: 280px;
  position: relative;
}
.display-art :deep(.person-art) {
  position: absolute;
  inset: 0;
  height: 100%;
}
.display-art :deep(svg) {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  object-fit: cover;
}
.display-information {
  padding: clamp(24px, 4vw, 56px);
}
.display-screen .display-person {
  min-height: 400px;
}
.display-widget {
  max-width: 720px;
}
@media (max-width: 540px) {
  .display-person {
    grid-template-columns: 1fr;
  }
  .display-art {
    min-height: 190px;
  }
  .display-header {
    margin-bottom: 24px;
  }
}
</style>
