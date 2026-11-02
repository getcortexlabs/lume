<script setup lang="ts">
import { useWorkspace } from "../../workspaces/composables/useWorkspace";
const { state: workspaceState } = useWorkspace();
import { publicationOptions } from "../../cases/presentation/choices";
import AppSelect from "../../../shared/ui/AppSelect.vue";
import { textStyle, flowStyle } from "../../../shared/ui/mavis-styles";
import { MButton, MColumn, MIcon, MRow, MText } from "@getcortexlabs/mavis-web";
import ReviewQueue from "../components/ReviewQueue.vue";
import ReviewEditor from "../components/ReviewEditor.vue";
import { useReviewWorkspace } from "../composables/useReviewWorkspace";
const {
  position,
  move,
  error,
  refresh,
  filter,
  setFilter,
  filtered,
  current,
  stats,
  busy,
  decisionError,
  success,
  select,
  decide,
} = useReviewWorkspace();
</script>
<template>
  <section class="wrap page-section review-page">
    <MRow class="review-top" data-mavis-flow :style="flowStyle('row')">
      <MColumn
        class="page-heading"
        data-mavis-flow
        :style="flowStyle('column')"
      >
        <MText
          class="eyebrow"
          data-mavis-text
          as="span"
          variant="overline"
          tone="text"
          :style="textStyle('overline', 'text')"
          >ÁREA DA ORGANIZAÇÃO · DEMONSTRAÇÃO</MText
        >
        <h1>Cuidar da informação<br />é cuidar de pessoas.</h1>
        <p>
          {{ workspaceState.organization.name }}
          <MText
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >·</MText
          >
          Revisão e publicação
        </p>
      </MColumn>
      <MRow class="operator" data-mavis-flow :style="flowStyle('row')">
        <MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >RL</MText
        >
        <div>
          <strong>Revisor Lume</strong><small>Acesso de demonstração</small>
        </div>
      </MRow>
    </MRow>
    <MRow gap="md" wrap class="workspace-links">
      <MButton text="Atualizar fila" variant="ghost" @click="refresh" />
      <RouterLink to="/organization/cases/new" class="button-link"
        >Cadastrar aviso fictício</RouterLink
      >
      <RouterLink to="/organization/simulation" class="text-link"
        >Cenários de demonstração</RouterLink
      >
      <RouterLink to="/organization/network" class="text-link"
        >Acompanhar divulgação</RouterLink
      >
      <RouterLink to="/organization/tasks" class="text-link"
        >Acompanhar pendências</RouterLink
      >
      <RouterLink to="/organization/sources" class="text-link"
        >Gerenciar fontes</RouterLink
      >
      <RouterLink to="/organization/withdrawals" class="text-link"
        >Acompanhar retiradas</RouterLink
      >
      <RouterLink to="/organization/tips" class="text-link"
        >Relatos de demonstração</RouterLink
      >
      <RouterLink to="/organization/drafts" class="text-link"
        >Retomar rascunhos</RouterLink
      >
    </MRow>
    <div class="review-stats">
      <div>
        <MIcon name="inbox" /><strong>{{ stats.pending }}</strong
        ><MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >Aguardando revisão</MText
        >
      </div>
      <div>
        <MIcon name="radio" /><strong>{{ stats.published }}</strong
        ><MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >Avisos publicados</MText
        >
      </div>
      <div>
        <MIcon name="eye-off" /><strong>{{ stats.withdrawn }}</strong
        ><MText
          data-mavis-text
          as="span"
          variant="caption"
          tone="text"
          :style="textStyle('caption', 'text')"
          >Divulgações retiradas</MText
        >
      </div>
    </div>
    <MRow class="demo-notice" data-mavis-flow :style="flowStyle('row')">
      <MIcon name="info" size="sm" /> Alterações duram enquanto esta página
      estiver aberta. Recarregar restaura os exemplos; rascunhos permanecem
      neste navegador. Nenhuma operação externa é realizada.
    </MRow>
    <MText
      v-if="success"
      class="success-message"
      role="status"
      data-mavis-text
      as="p"
      variant="body"
      tone="muted"
      :style="textStyle('body', 'muted')"
      >{{ success }}</MText
    >
    <div v-if="error" role="alert">
      {{ error }} <MButton text="Tentar novamente" @click="refresh" />
    </div>
    <MRow v-if="!error" gap="md" wrap class="review-navigation"
      ><MButton
        text="Registro anterior"
        variant="secondary"
        :disabled="busy || position <= 0"
        @click="move(-1)" /><MText variant="caption"
        >{{ current ? position + 1 : 0 }} de {{ filtered.length }} · Alt + ← /
        →</MText
      ><MButton
        text="Próximo registro"
        variant="secondary"
        :disabled="busy || position >= filtered.length - 1"
        @click="move(1)"
    /></MRow>
    <div v-if="!error" class="review-workspace">
      <aside>
        <div class="queue-heading">
          <MText
            data-mavis-text
            as="h2"
            variant="title"
            tone="text"
            :style="textStyle('title', 'text')"
            >Fila de revisão</MText
          >
          <AppSelect
            id="review-status"
            label="Filtrar por situação"
            :model-value="filter"
            :options="publicationOptions"
            @update:model-value="setFilter"
          />
        </div>
        <ReviewQueue
          :records="filtered"
          :selected="current?.id ?? ''"
          @select="select"
        />
      </aside>
      <ReviewEditor
        v-if="current"
        :key="`${current.id}-${current.revision}`"
        :record="current"
        :busy="busy"
        :error="decisionError"
        @decide="decide"
      />
      <div v-else class="empty-state">
        <MIcon name="check-check" :size="32" />
        <MText
          data-mavis-text
          as="h2"
          variant="title"
          tone="text"
          :style="textStyle('title', 'text')"
          >Tudo em dia por aqui.</MText
        >
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >Não há registros nesta situação.</MText
        >
      </div>
    </div>
  </section>
</template>
