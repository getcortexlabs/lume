# Adoção do Mavis no Lume

Revisão: 2 de novembro de 2026. Mavis Web/Core **0.1.0-alpha.6** e Jolt **0.1.0-rc.8**, instalados do npm com versões exatas. A tag Mavis aponta para `81b6b6b6e6576511755d6ee5a5943d9bcd66e09d`. `vendor/manifest.json` registra a procedência e o lockfile preserva URLs/integridades. Nenhum checkout vizinho foi alterado.

## Uso atual

A auditoria registra **27 tipos Mavis, 624 ocorrências estáticas e nenhum controle HTML nativo próprio**. Essa contagem não representa porcentagem do código nem autoria visual: extrair as três formas de ajudar para uma composição reutilizável reduz ocorrências enquanto amplia o uso dos componentes.

## O que a alpha.6 substituiu

| Antes no Lume | Agora |
| --- | --- |
| AppReveal + useRevealHeight | MReveal diretamente: altura automática, presença durante fechamento, reversão, foco e movimento reduzido. Os dois arquivos locais foram removidos. |
| MInput como fallback para datas incompletas | MDatePicker com `draft` controlado. A data parcial persiste e o calendário continua disponível. |
| CSS de prontidão do calendário | Ações de calendário aguardam hidratação dentro do Mavis. |
| Gerador local useMavisTokens e variáveis `--lume-*` | useMavisTokens público e variáveis `--m-color-*`, `--m-space-*`, `--m-radius-*`, `--m-type-*`. |
| Card dentro de RouterLink com aparência de link manual | MCard com `href` e `navigate`, composto com o slot custom do RouterLink: uma âncora real, com press do Mavis. |
| CTAs manuais da abertura | MButton com navegação real e MLink na legenda regional. |
| Flex editorial em agrupamentos selecionados | MStack nas ações da abertura, nas formas de ajudar e na barra dos resultados. |
| Entrada CSS da abertura | Timeline finita em useMavisWebMotion, sobre wrappers HTML da aplicação. |
| SVG com stroke-dashoffset/keyframes CSS | Três caminhos contínuos controlados por `scope.drawPath`. Trocar a cidade desenha seu caminho e recolhe os anteriores. |
| Runtime isolado para a lista | Região MBox com escopo emprestado: animateLayout nos wrappers externos e animateItems nos internos, com identidade por aviso. |
| Diretiva viewport escrita à mão | createViewportEnterDirective do Jolt, criada por componente, com entradas estáveis e conteúdo SSR legível. |
| CSS concorrendo com transforms dos cards | MotionSurface no card para hover/foco, compondo com press do Mavis. |

## Acabamento visual e movimento

- A frase “Gentileza gera gentileza”, o título, as ações e o contexto entram em sequência. O texto mantém contraste completo durante o movimento.
- A rede responde à cidade escolhida, ao ponteiro e ao toque; o símbolo pulsa brevemente e a legenda acompanha a seleção. A cena é ilustrativa, sem contadores fictícios apresentados como impacto real.
- A observação de geometria do Jolt acompanha alterações de texto, fontes e largura nas superfícies HTML animadas.
- Os avisos preservam suas chaves durante filtros e ordenação. O reposicionamento e a entrada atuam em wrappers diferentes, sem disputar a superfície de press do card.
- Os retornos administrativos usam OperationFeedback: composição de Reveal, Card, Icon e Text, sem alterar decisões do domínio.
- A troca de avisos nas telas usa useContentTransition sobre o adapter Vue do Jolt. Expiração, pausa e retirada continuam sendo decisões da aplicação.
- Durações de entrada/saída e press vêm do tema Mavis. As sequências da identidade têm tempos próprios do produto, finitos e canceláveis.

A preferência de movimento reduzido é respeitada. A coreografia da abertura evita fades de texto; movimento não bloqueia navegação. Não há animações decorativas infinitas. Todos os recursos e watchers adicionais são liberados junto do escopo. As opções da diretiva de entrada mantêm identidade estável entre renders, evitando recriar observadores nas atualizações de layout.

## Direção editorial e rolagem

A página inicial usa fundo de papel, títulos fortes, avisos com bordas de cartaz e uma rede gráfica sem glassmorphism ou brilho difuso. O símbolo original é preservado; na rede, uma versão monocromática é obtida com CSS.

A abertura entra por linha e desenha o sublinhado com drawPath. Wrappers HTML da aplicação recebem a animação; os MText internos preservam a tipografia e o contrato de conteúdo do Mavis. As cidades entram em sequência em wrappers separados dos botões. Os wrappers de entrada dos avisos e das formas de ajudar usam origem fixa: suas translações não dependem de um centro que muda de posição no breakpoint. CareJourney reaproveita MotionSurface para hover e foco.

useKindnessMotion usa viewportEnter nas duas linhas do manifesto e scrollLinked na faixa decorativa. A faixa responde à leitura, sem timer ou reprodução infinita. O texto repetido é aria-hidden, e o título real permanece disponível. O escopo Mavis libera os recursos na navegação. MThemeProvider define o contraste dos MLink nas duas superfícies escuras.

## O que permanece local

**Composição do produto:** useHeroMotion, useConnectionMotion, useCardEmphasis, useListLayout, useContentTransition, useKindnessMotion e CareJourney descrevem quais elementos respondem, quando e com qual intenção. Mavis/Jolt executam interpolação, desenho, press, observação, interrupção e descarte. Esses composables não são motores alternativos nem recursos ausentes nas bibliotecas.

**Identidade e layout editorial:** grades de avisos, tipografia fluida, proporções, fundos e posicionamento da rede continuam em CSS do Lume. MStack resolve stacks responsivos e wrapping; não é uma API geral de grid. textStyle/flowStyle/cardStyle ainda traduzem overrides editoriais antigos; o gerador de tokens foi removido, mas esses helpers podem ser reduzidos gradualmente.

**Dados e navegação:** AppDateInput converte strings do domínio em CivilDate/null e diferencia busca válida de rascunho. AppSelect traduz o contrato de escolha. RouterLink continua responsável pelo destino, histórico e query; Mavis renderiza os novos links. Não há necessidade de substituir o roteador.

**Foco de ações específicas:** o detalhe ainda mantém a preparação de foco dos gatilhos de seus diálogos. A correção embutida de calendário não equivale a remover essa composição de todos os diálogos da aplicação.

## Lista revisada de possibilidades upstream

### Mavis

- **MStack.responsive no Safari:** a troca de direção dentro da observação de tamanho reproduziu `ResizeObserver loop completed with undelivered notifications`. Nesta entrega usamos MStack com wrapping e bases flexíveis estáveis, preservando a adaptação móvel sem silenciar erros do navegador. A atualização de layout do breakpoint precisa evitar esse ciclo no Mavis.
- Grid responsivo é diferente de MStack. Um contrato de grid poderia substituir parte das grades editoriais se houver demanda comum entre consumidores.
- Um padrão geral de gatilho/diálogo pode eliminar a preparação de foco restante nas ações do detalhe.
- Mais receitas e parâmetros compartilhados de movimento podem reduzir números repetidos. Entrada, saída e press já possuem tokens; não devem ser listados como ausentes.

Links em Button/Card, tokens públicos, altura do Reveal, rascunho textual de DatePicker e prontidão do calendário saíram da lista de lacunas.

### Jolt Web

Desenho de caminhos SVG saiu da lista: drawPath já está no RC.8 e em uso. animateSize, animateLayout, animateItems, viewport, pointerFollow, timelines, estados e scopes também estão disponíveis. Não foi identificada uma nova capacidade obrigatória do motor para concluir esta entrega.

Limites de contrato continuam relevantes: drawPath desenha um contorno contínuo por alvo, não faz morphing de geometria; composição SVG é específica de Web. Esses limites não impedem a rede atual e não são pedidos automáticos de implementação.

## Verificação

Build/tipos, domínio, HTTP/SSR e auditoria de controles. Playwright cobre Chromium, Firefox e WebKit: links reais/teclado, troca rápida de cidades, redimensionamento, movimento reduzido, layout móvel, Reveal, datas parciais, hidratação e todos os fluxos anteriores. Axe cobre as páginas e o calendário.

Nos testes de rotação/expiração, apenas Date é fixado: timers e o relógio de documento/WAAPI permanecem reais, para não misturar um relógio de animação real com performance/RAF artificialmente adiantados. A espera observa o resultado do intervalo real e o término da transição.
