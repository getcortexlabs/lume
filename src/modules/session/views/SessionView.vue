<script setup lang="ts">
import { computed } from "vue";
import { MButton, MCard, MColumn, MText } from "@getcortexlabs/mavis-web";
import { useSessionActions } from "../composables/useSessionActions";
import { useClientReady } from "../../../shared/composables/useClientReady";
const clientReady = useClientReady();
const props = defineProps<{ mode: "sign-in" | "expired" | "denied" }>();
const { session, enter } = useSessionActions();
const content = computed(() =>
  props.mode === "expired"
    ? {
        title: "Vamos retomar de onde parou.",
        description:
          "A sessão de demonstração expirou. Os rascunhos já salvos neste navegador continuam disponíveis.",
        action: "Retomar sessão de demonstração",
      }
    : props.mode === "denied"
      ? {
          title: "Este perfil não tem acesso.",
          description:
            "Nesta simulação, o perfil escolhido não pode abrir a área da organização. Você pode voltar aos avisos ou experimentar o perfil de revisor.",
          action: "Usar perfil de revisor",
        }
      : {
          title: "Cuidar começa com você.",
          description:
            "Entre na área da organização para conhecer os fluxos com informações fictícias. Não é necessário informar e-mail ou senha.",
          action: "Entrar na demonstração",
        },
);
</script>
<template>
  <section class="wrap page-section session-page">
    <div class="page-heading">
      <p class="eyebrow">ACESSO DE DEMONSTRAÇÃO</p>
      <h1>{{ content.title }}</h1>
    </div>
    <MCard padding="lg" gap="lg">
      <MText as="p">{{ content.description }}</MText>
      <MText as="p" variant="caption" tone="muted"
        >Esta experiência simula uma sessão. A autenticação real ainda não está
        conectada.</MText
      >
      <MColumn gap="md">
        <MButton :text="content.action" @click="enter" />
        <RouterLink to="/cases" custom v-slot="{ href, navigate }"
          ><MButton
            :href="href"
            :navigate="() => navigate()"
            text="Continuar nos avisos públicos"
            variant="secondary"
        /></RouterLink>
      </MColumn>
      <MText v-if="clientReady && session.message.value" role="status">{{
        session.message.value
      }}</MText>
    </MCard>
  </section>
</template>
<style scoped>
.session-page {
  max-width: 720px;
}
</style>
