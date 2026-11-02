<script setup lang="ts">
import OperationFeedback from "../../../shared/ui/OperationFeedback.vue";
import { MReveal } from "@getcortexlabs/mavis-web";
import EvidenceDocument from "./EvidenceDocument.vue";
const highlightedQuote = ref("");
import VersionComparison from "./VersionComparison.vue";
import ReviewAssistance from "./ReviewAssistance.vue";
import { MCheckbox } from "@getcortexlabs/mavis-web";
import {
  textStyle,
  flowStyle,
  cardStyle,
} from "../../../shared/ui/mavis-styles";
import { ref, watch } from "vue";
import {
  MButton,
  MCard,
  MColumn,
  MIcon,
  MInput,
  MRow,
  MText,
} from "@getcortexlabs/mavis-web";
import type { ReviewCase } from "../../cases/domain/case";
import { formatDate } from "../../cases/domain/case";
const props = defineProps<{
  record: ReviewCase;
  busy: boolean;
  error: string;
}>();
const emit = defineEmits<{
  decide: [status: "published" | "withdrawn", reason: string];
}>();
const reason = ref(""),
  confirmed = ref(false),
  ai = ref(false);
watch(
  () => props.record.id,
  () => {
    reason.value = "";
    confirmed.value = false;
    ai.value = false;
  },
);
const labels = {
  in_review: "Aguardando revisão",
  published: "Publicado",
  withdrawn: "Divulgação retirada",
};
</script>
<template>
  <MColumn class="review-editor" data-mavis-flow :style="flowStyle('column')">
    <MRow
      class="review-editor-heading"
      data-mavis-flow
      :style="flowStyle('row')"
    >
      <div>
        <MText
          class="eyebrow"
          data-mavis-text
          as="span"
          variant="overline"
          tone="text"
          :style="textStyle('overline', 'text')"
          >{{ record.id.toUpperCase() }} · V{{ record.revision }}</MText
        >
        <MText
          data-mavis-text
          as="h2"
          variant="title"
          tone="text"
          :style="textStyle('title', 'text')"
          >{{ record.name }}</MText
        >
      </div>
      <MText
        class="status-label"
        :class="record.status"
        data-mavis-text
        as="span"
        variant="caption"
        tone="text"
        :style="textStyle('caption', 'text')"
        >{{ labels[record.status] }}</MText
      >
    </MRow>
    <div class="evidence-grid">
      <section class="evidence-document">
        <MRow
          class="evidence-heading"
          data-mavis-flow
          :style="flowStyle('row')"
        >
          <MIcon name="file-text" size="sm" /><strong
            >Registro de origem</strong
          >
        </MRow>
        <EvidenceDocument :source="record.evidence" :quote="highlightedQuote" />
        <div class="document-foot">Fonte fictícia · conteúdo reservado</div>
      </section>
      <section class="extracted-fields">
        <MRow
          class="evidence-heading"
          data-mavis-flow
          :style="flowStyle('row')"
        >
          <MIcon name="list-checks" size="sm" /><strong
            >Campos para divulgação</strong
          >
        </MRow>
        <dl>
          <div>
            <dt>Nome informado</dt>
            <dd>{{ record.name }}</dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>{{ record.age }} anos</dd>
          </div>
          <div>
            <dt>Município e região</dt>
            <dd>{{ record.city }} · {{ record.neighborhood }}</dd>
          </div>
          <div>
            <dt>Data de desaparecimento</dt>
            <dd>{{ formatDate(record.missingSince) }}</dd>
          </div>
        </dl>
        <MButton
          text="Simular apoio da IA"
          variant="secondary"
          icon="sparkles"
          size="sm"
          :aria-expanded="ai"
          aria-controls="ai-evidence"
          @click="ai = !ai"
        />
        <MReveal :show="ai" id="ai-evidence"
          ><MCard
            class="ai-result"
            data-mavis-card
            padding="none"
            radius="md"
            :style="cardStyle"
          >
            <strong>Sugestão simulada · sem chamada de IA</strong>
            <MText
              data-mavis-text
              as="p"
              variant="body"
              tone="muted"
              :style="textStyle('body', 'muted')"
              >Município: {{ record.city }}</MText
            >
            <blockquote>“Município: {{ record.city }}”</blockquote>
            <MText
              data-mavis-text
              as="p"
              variant="body"
              tone="muted"
              :style="textStyle('body', 'muted')"
            >
              Trecho localizado no registro de origem. A aprovação continua
              sendo uma decisão humana.
            </MText>
          </MCard></MReveal
        >
      </section>
    </div>
    <ReviewAssistance :record="record" @highlight="highlightedQuote = $event" />
    <MColumn
      v-if="record.status !== 'withdrawn'"
      class="review-decision"
      data-mavis-flow
      :style="flowStyle('column')"
    >
      <MInput
        v-model="reason"
        label="Justificativa da decisão"
        placeholder="Registre o que foi revisado e o motivo da decisão."
        :multiline="true"
        :rows="2"
      /><MCheckbox
        v-model="confirmed"
        label="Conferi a origem e os campos desta publicação fictícia."
      />
      <OperationFeedback :error="error" />
      <MRow class="decision-actions" data-mavis-flow :style="flowStyle('row')">
        <MButton
          v-if="record.status === 'in_review'"
          text="Aprovar publicação"
          icon="check"
          :disabled="!reason.trim() || !confirmed"
          :loading="busy"
          @click="emit('decide', 'published', reason)"
        /><MButton
          v-if="record.status === 'published'"
          text="Retirar divulgação"
          icon="eye-off"
          variant="secondary"
          :disabled="!reason.trim() || !confirmed"
          :loading="busy"
          @click="emit('decide', 'withdrawn', reason)"
        /><MButton
          v-if="record.status === 'published'"
          text="Revalidar divulgação"
          variant="ghost"
          :disabled="!reason.trim() || !confirmed"
          :loading="busy"
          @click="emit('decide', 'published', reason)"
        /><RouterLink
          v-if="record.status === 'published'"
          class="text-link"
          :to="`/cases/${record.id}`"
          >Ver página pública <MIcon name="arrow-up-right" size="sm"
        /></RouterLink>
      </MRow>
    </MColumn>
    <MCard
      v-else
      class="soft-note"
      data-mavis-card
      padding="none"
      radius="md"
      :style="cardStyle"
    >
      <strong>A divulgação foi retirada.</strong>
      <MText
        data-mavis-text
        as="p"
        variant="body"
        tone="muted"
        :style="textStyle('body', 'muted')"
      >
        O aviso deixou a busca e a prévia da rede. Sua situação de
        desaparecimento não foi alterada. A republicação está bloqueada nesta
        demonstração.
      </MText>
    </MCard>
    <RouterLink
      v-if="record.status === 'withdrawn'"
      to="/organization/withdrawals"
      class="text-link"
      >Acompanhar retirada nos canais</RouterLink
    >
    <VersionComparison :versions="record.versions ?? []" />
    <section class="decision-history">
      <MText
        data-mavis-text
        as="h3"
        variant="heading"
        tone="text"
        :style="textStyle('heading', 'text')"
        >Histórico de decisões</MText
      >
      <div v-for="(event, index) in record.history" :key="index">
        <span class="timeline-dot"></span><strong>{{ event.action }}</strong
        ><time>{{ formatDate(event.at) }}</time>
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
          >{{ event.reason }}</MText
        >
      </div>
    </section>
  </MColumn>
</template>
