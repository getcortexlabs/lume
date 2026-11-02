<script setup lang="ts">
import {
  MColumn,
  MRow,
  MCard,
  MText,
  MButton,
  MCheckbox,
  MBadge,
} from "@getcortexlabs/mavis-web";
import { useNotifications } from "../composables/useNotifications";
const { visible, unread, unreadOnly, read, error, actionError, loading } =
  useNotifications();
</script>
<template>
  <section class="wrap page-section">
    <RouterLink to="/organization" class="back-link"
      >← Voltar à organização</RouterLink
    >
    <div class="page-heading">
      <p class="eyebrow">O CUIDADO CONTINUA</p>
      <h1>O próximo passo<br />merece atenção.</h1>
      <p>
        Atualizações da sua equipe, reunidas aqui. Eventos locais de
        demonstração; nenhum e-mail ou alerta externo é enviado.
      </p>
    </div>
    <MRow gap="lg" wrap
      ><MBadge :text="`${unread} não lidas`" /><MCheckbox
        v-model="unreadOnly"
        label="Mostrar apenas não lidas" /><MButton
        text="Marcar todas como lidas"
        variant="secondary"
        :disabled="!unread || !!error"
        @click="read()"
    /></MRow>
    <MText v-if="error || actionError" role="alert">{{
      error || actionError
    }}</MText
    ><MText v-if="loading" role="status">Carregando atualizações…</MText>
    <MColumn v-else-if="!error" gap="md" class="notification-list"
      ><MCard v-for="notice in visible" :key="notice.id" padding="lg" gap="md"
        ><MRow gap="md" wrap
          ><MBadge :text="notice.read ? 'Lida' : 'Nova'" /><MText
            variant="caption"
            >{{ new Date(notice.createdAt).toLocaleString("pt-BR") }}</MText
          ></MRow
        ><MText as="h2" variant="heading">{{ notice.title }}</MText
        ><MText>{{ notice.detail }}</MText
        ><MRow gap="md" wrap
          ><RouterLink
            :to="notice.href"
            class="text-link"
            @click="read(notice.id)"
            >Abrir tarefa</RouterLink
          ><MButton
            v-if="!notice.read"
            text="Marcar como lida"
            variant="ghost"
            @click="read(notice.id)" /></MRow></MCard
      ><MText v-if="!visible.length"
        >Tudo acompanhado por aqui. Novos eventos aparecerão nesta lista.</MText
      ></MColumn
    >
  </section>
</template>
<style scoped>
.notification-list {
  margin-top: 24px;
}
</style>
