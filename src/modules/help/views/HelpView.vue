<script setup lang="ts">
import { textStyle, flowStyle } from "../../../shared/ui/mavis-styles";
import { MColumn, MIcon, MText } from "@getcortexlabs/mavis-web";
</script>
<template>
  <section class="wrap page-section help-page">
    <MColumn class="page-heading" data-mavis-flow :style="flowStyle('column')">
      <MText
        class="eyebrow"
        data-mavis-text
        as="span"
        variant="overline"
        tone="text"
        :style="textStyle('overline', 'text')"
        >INFORMAÇÃO PARA O PRÓXIMO PASSO</MText
      >
      <h1>Você não precisa<br />começar sem orientação.</h1>
      <MText
        data-mavis-text
        as="p"
        variant="body"
        tone="muted"
        :style="textStyle('body', 'muted')"
      >
        Se alguém desapareceu, procure a Polícia Civil para registrar a
        ocorrência.
      </MText>
    </MColumn>
    <div class="urgent-note">
      <MIcon name="clock-3" :size="28" />
      <div>
        <MText
          data-mavis-text
          as="h2"
          variant="title"
          tone="text"
          :style="textStyle('title', 'text')"
          >Não é preciso esperar 24 horas.</MText
        >
        <p>
          Comunique o desaparecimento assim que perceber a ausência incomum. Em
          emergência ou risco imediato, ligue <a href="tel:190">190</a>.
        </p>
      </div>
    </div>
    <div class="help-layout">
      <div class="help-steps">
        <article>
          <MText
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >01</MText
          >
          <div>
            <MText
              data-mavis-text
              as="h2"
              variant="title"
              tone="text"
              :style="textStyle('title', 'text')"
              >Registre o desaparecimento</MText
            >
            <MText
              data-mavis-text
              as="p"
              variant="body"
              tone="muted"
              :style="textStyle('body', 'muted')"
            >
              Procure a delegacia de Polícia Civil mais próxima e relate o que
              aconteceu. O registro oficial é o primeiro passo para acionar a
              busca.
            </MText>
          </div>
        </article>
        <article>
          <MText
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >02</MText
          >
          <div>
            <MText
              data-mavis-text
              as="h2"
              variant="title"
              tone="text"
              :style="textStyle('title', 'text')"
              >Organize o que você sabe</MText
            >
            <MText
              data-mavis-text
              as="p"
              variant="body"
              tone="muted"
              :style="textStyle('body', 'muted')"
            >
              Separe uma foto recente, nome completo, idade, roupas e
              informações sobre o último contato. Distingua o que você sabe do
              que ainda é uma dúvida.
            </MText>
          </div>
        </article>
        <article>
          <MText
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >03</MText
          >
          <div>
            <MText
              data-mavis-text
              as="h2"
              variant="title"
              tone="text"
              :style="textStyle('title', 'text')"
              >Compartilhe com responsabilidade</MText
            >
            <MText
              data-mavis-text
              as="p"
              variant="body"
              tone="muted"
              :style="textStyle('body', 'muted')"
            >
              Combine a divulgação com a equipe responsável. Preserve
              documentos, endereços e contatos pessoais. Mantenha um canal
              confiável para receber informações.
            </MText>
          </div>
        </article>
        <article>
          <MText
            data-mavis-text
            as="span"
            variant="caption"
            tone="text"
            :style="textStyle('caption', 'text')"
            >04</MText
          >
          <div>
            <MText
              data-mavis-text
              as="h2"
              variant="title"
              tone="text"
              :style="textStyle('title', 'text')"
              >Mantenha as informações atualizadas</MText
            >
            <MText
              data-mavis-text
              as="p"
              variant="body"
              tone="muted"
              :style="textStyle('body', 'muted')"
            >
              Comunique novidades à autoridade responsável. Quando houver
              localização, informe a equipe para atualizar os registros e
              orientar a retirada dos avisos.
            </MText>
          </div>
        </article>
      </div>
      <aside class="help-aside">
        <MIcon name="heart-handshake" :size="32" />
        <MText
          data-mavis-text
          as="h3"
          variant="heading"
          tone="text"
          :style="textStyle('heading', 'text')"
          >Cuidado também é acolhimento.</MText
        >
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
        >
          Procure alguém de confiança para acompanhar você e ajudar a organizar
          os próximos passos.
        </MText>
        <hr />
        <strong>Sobre esta demonstração</strong>
        <MText
          data-mavis-text
          as="p"
          variant="body"
          tone="muted"
          :style="textStyle('body', 'muted')"
        >
          O Lume ainda não recebe ocorrências ou relatos. A consulta aos avisos
          fictícios não substitui o registro oficial.
        </MText>
        <a
          href="https://prefeitura.sp.gov.br/web/direitos_humanos/w/desaparecidos/orientacoes_gerais/254696"
          target="_blank"
          rel="noopener noreferrer"
          class="text-link"
          >Orientações oficiais de São Paulo
          <MIcon name="external-link" size="sm"
        /></a>
      </aside>
    </div>
    <MText
      class="source-reference"
      data-mavis-text
      as="p"
      variant="body"
      tone="muted"
      :style="textStyle('body', 'muted')"
    >
      Referência: Prefeitura de São Paulo, “O que fazer em caso de
      desaparecimento”. Consulte o órgão responsável para orientações sobre o
      seu caso.
    </MText>
  </section>
</template>
