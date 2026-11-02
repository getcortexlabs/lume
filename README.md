# Lume

Front-end web da plataforma de apoio à busca de pessoas desaparecidas. Nuxt 4, Vue 3, TypeScript, Vue Router e Mavis Web. Toda a operação usa exemplos fictícios. Rascunhos ficam no armazenamento local do navegador; os demais estados permanecem em memória.

## Executar

Node 22.12 ou superior.

```sh
npm ci
npm run dev
```

Abra **http://127.0.0.1:5190**.

```sh
npm run build        # Tipos e servidor Nuxt/Nitro em .output/
npm run preview      # Servir o build em http://127.0.0.1:4188
npm test             # Contratos e invariantes do repositório mock
npm run test:render  # Respostas HTTP do build Nuxt, conteúdo SSR e isolamento público
npm run test:e2e     # Playwright: jornadas, SSR/hidratação, responsividade e axe
npm run test:ssr     # HTML sem JavaScript, requisições concorrentes e edição antes da hidratação
```

Para executar os testes de navegador em outra máquina, instale os navegadores do Playwright com `npx playwright install chromium firefox webkit`.

## Experiências

As URLs usam inglês: `/cases`, `/cases/:id`, `/guidance`, `/network` e `/organization`. A busca usa `search`, `city`, `age`, `sort`, `dateField`, `from`, `to`, `page` e `pageSize` na query string. Textos da interface continuam em português. Exemplo: `/cases?city=Suzano&sort=name`.

| Rota            | Experiência                                                                         |
| --------------- | ----------------------------------------------------------------------------------- |
| `/`             | Apresentação, escolha de cidade e avisos recentes                                   |
| `/cases`        | Busca por nome/cidade, região e faixa etária, filtros removíveis e ordenação na URL |
| `/cases/:id`    | Versão pública, origem, revisão, compartilhamento e retorno à busca                 |
| `/guidance`     | Primeiros passos e referência oficial                                               |
| `/network`      | Prévia regional de widget e tela; navegação entre avisos                            |
| `/organization` | Fila, evidências, simulação de IA, decisão e histórico                              |

Novas jornadas:

- `/organization/cases/new`: cadastro em quatro etapas, validação, autorização simulada e prévia pública.
- `/organization/drafts` e `/organization/drafts/:id`: salvar e retomar rascunhos persistentes neste navegador.
- `/organization/network`: parceiros fictícios, versões por aviso, falhas, reconexão e expiração das cópias.
- `/organization/simulation`: latência, indisponibilidade, perfil somente leitura e conflito na próxima alteração.

Para demonstrar o ciclo completo, cadastre uma pessoa fictícia, salve e retome o rascunho, envie para revisão, aprove e abra o aviso público. Na organização, revalide a divulgação para produzir uma nova versão ou retire o aviso. No painel da rede, conecte o parceiro da cidade para acompanhar as versões. Desconecte-o antes da retirada para observar pendência e expiração. A simulação remove o conteúdo expirado da exibição; reconectar reconsulta o estado atual e não restaura um aviso retirado.

A busca distingue período de desaparecimento e de revisão, inclui paginação e preserva o contexto ao navegar entre avisos. Uma publicação retirada exibe uma mensagem sem dados da pessoa; um registro inexistente ou ainda privado permanece indisponível.

Na revisão, Antônio Lima contém uma divergência fictícia entre fontes. Corrija ou aceite a sugestão com evidência antes de publicar. A comparação de possíveis duplicidades usa nome ou município, idade e período próximos; não une registros automaticamente. Cadastros novos começam com conferência manual.

O percurso completo começa em `/organization`: selecione Beatriz Santos, informe uma justificativa, confirme a revisão e aprove. O aviso aparece na busca e na prévia da rede. Retire a divulgação usando uma nova justificativa; ele deixa ambos os lugares. O mock bloqueia republicação e rejeita decisões sobre revisões antigas.

Na experiência pública, filtre e ordene em `/cases`, abra um aviso e use “Voltar para minha busca”. O contexto fica na URL e sobrevive ao recarregamento. Cada chip permite remover um filtro; a ordenação distingue revisão recente, desaparecimento recente e nome. “Compartilhar aviso” abre uma prévia explicitamente fictícia com texto e link copiáveis. O link compartilhado exclui os parâmetros da busca; se o navegador recusar a cópia, os campos permitem seleção manual. Nenhuma mensagem é enviada a serviços externos.

Rascunhos são salvos automaticamente em `localStorage` e compartilhados entre abas da mesma origem, com controle de revisão. As decisões de publicação, os históricos e os parceiros continuam em memória: recarregar reinicia esses exemplos. A área da organização tem acesso livre de demonstração; não implementa autenticação. Nenhuma pista, cadastro ou documento real é recebido. Não há chamadas de IA, crawler, APIs externas, notificações externas, sincronização externa ou coleta de localização. A comunicação entre as telas e os mocks atravessa um transporte HTTP local simulado. O configurador em `/organization/displays` gera código de incorporação funcional para os exemplos locais; ele não oferece sincronização entre instâncias.

## Piloto guiado, organizações e divulgação

- `/organization/settings`: troca entre Horizonte e Aurora. Cada organização tem casos, fontes, relatos, rede, permissões e notificações próprios. Rascunhos usam chaves diferentes no armazenamento local. A troca desmonta a página anterior e rejeita respostas atrasadas. A interface simula isolamento; autorização real ainda precisa ser implementada no servidor.
- `/organization/notifications`: eventos locais acionáveis, leitura individual/em lote e filtro de não lidas. Repetir um comando com a mesma chave de idempotência não duplica o aviso. Não há e-mail ou push.
- `/organization?status=in_review&case=beatriz-santos`: seleção e filtro na URL, anterior/próximo e atalhos Alt + setas. Atalhos ignoram campos, diálogos e alterações em andamento. “Destacar na fonte” marca somente uma ocorrência literal, renderizada como texto escapado.
- `/organization/displays`: configuração de cidade e intervalo, com URLs e código de iframe. `/embed` e `/screen` são superfícies independentes, sem cabeçalho/rodapé do portal. As queries `city`, `interval` e `organization` são validadas por listas permitidas.
- `/organization/guide`: acompanha cinco etapas a partir dos dados reais da simulação. O registro importado já vem preparado; a conferência, publicação, relato e retirada são ações explícitas. Reiniciar exige confirmação e afeta apenas a organização atual. Rascunhos são preservados por padrão; sua exclusão é uma opção separada.

O modo de divulgação reconsulta a cada 20 segundos e concede validade de 60 segundos à cópia. Sem nova consulta bem-sucedida, os dados são ocultados. Rotação pode ser pausada; movimento reduzido começa pausado. Trocas de região invalidam respostas antigas. Timers e eventos são removidos ao sair da rota. Estas páginas são renderizadas no cliente para iniciar a validade com uma consulta local, sem transportar uma cópia pessoal em HTML estático.

Mudanças em publicação sincronizam dentro da mesma instância da aplicação. Uma nova aba, iframe ou dispositivo inicia seus próprios exemplos; não há sincronização externa. Recarregar restaura a Horizonte, exceto nas URLs `/embed` e `/screen`, que respeitam a organização explícita. Os rascunhos sobrevivem ao recarregamento por organização. Não usar dados reais.

A composição `createWorkspaceServices` delega os contratos existentes ao grafo ativo. Cada grafo é criado por aplicação e organização. Reiniciar invalida também gravações antigas no armazenamento de rascunhos. As notificações possuem contrato próprio, pronto para um adaptador futuro; ainda não há endpoint HTTP de notificações nem autenticação ou seleção de organização no backend. Para integração real, esses limites precisam fazer parte do contrato do servidor.

## Continuidade e acompanhamento

- Rascunhos: salvamento automático após 700 ms, indicação de pendência/salvamento, retomada após recarregar e aviso antes de fechar com alterações pendentes. A navegação interna tenta salvar antes de sair; falhas são mostradas sem descartar os campos. Apenas dados fictícios devem ser usados. Limpar os dados do navegador apaga os rascunhos.
- Persistência: `DraftStore` é injetado na composição. O adaptador valida o formato local, rejeita revisões antigas entre abas e não substitui armazenamento corrompido. Identificadores UUID evitam reutilização. É uma simulação local, sem sincronização entre dispositivos ou garantia de transação distribuída entre abas.
- Histórico: “O que mudou” na revisão compara a versão atual com uma anterior, incluindo situação, campos públicos, revisor e justificativa. Os snapshots permanecem privados e não entram no payload público do Nuxt.
- Cartaz: `/cases/:id/poster`, acessível em “Preparar cartaz”, tem QR gerado localmente, origem, revisão, aviso de demonstração e CSS de impressão A4. “Imprimir ou salvar PDF” usa o diálogo do navegador e reconsulta a publicação antes de abrir. A retirada remove o cartaz durante a sessão. Impressos não podem ser atualizados; o QR aponta à página atual. Em localhost, o endereço só é acessível no próprio dispositivo.
- Pendências: `/organization/tasks` reúne revisão inicial, publicações revisadas há mais de 24 horas, fontes indisponíveis ou sem atualização há 72 horas e problemas de distribuição. Os prazos são de demonstração. As ações levam à revisão/canal correto, e a simulação de atualização de fonte resolve sua pendência sem consultar serviços externos.
- Consulta e atualização de fonte têm datas distintas. Uma falha na fonte não altera a situação da pessoa ou confirma localização.

O QR usa [node-qrcode](https://github.com/soldair/node-qrcode), empacotado somente na rota do cartaz. Não há serviço externo de geração.

## Fontes, retiradas e relatos privados

- `/organization/sources`: cadastrar/editar fonte fictícia, responsável, intervalo de 1–168 horas e ativação. Inspecionar registros importados, repetidos e divergentes, com acesso direto à revisão. Consultar atualiza a tentativa e, se houver sucesso, a última consulta concluída; preserva a atualização informada pela origem. Recuperação é uma ação explicitamente simulada, sem acesso à URL cadastrada.
- `/organization/drafts`: duplicar (com autorização desmarcada) e excluir mediante confirmação. No editor, um conflito mostra os valores locais e da outra aba. Alterações independentes podem ser combinadas; campos modificados dos dois lados exigem escolha. Também é possível adotar a versão salva ou criar uma cópia das edições locais, inclusive após exclusão em outra aba.
- `/organization/withdrawals`: acompanhamento por aviso e canal, distinguindo retirada confirmada, pendência, validade expirada sem confirmação e ausência de entrega. A tela oferece tentativa manual e acesso ao canal; a data sugerida de repetição não representa um job agendado.
- `/organization/tips`: receber um texto de exemplo fixo e fictício, revisar, simular encaminhamento para destinatários de demonstração e simular confirmação. Não existe formulário público que receba relatos reais. Texto original, dúvidas e horário aproximado são preservados. Receber, encaminhar e confirmar são estados diferentes, com revisão e histórico reservados.
- `/organization/simulation`: o painel HTTP lista até 20 métodos, rotas e códigos de resposta, sem bodies ou valores de busca. Perfis, latência, indisponibilidade e conflitos afetam também as novas jornadas.

`src/shared/http/client.ts` define o cliente independente de Nuxt. `src/app/http/http-repositories.ts` implementa os contratos de repositório usando esse cliente. `mock-http-transport.ts` recebe objetos Request e devolve Response dentro do processo: **não usa fetch de rede, service worker ou servidor de negócio**. A simulação representa 200/201/204, 403, 404/410, 409, 422 e 503, paginação e repetição idempotente. As assinaturas locais de eventos são uma porta separada para futura invalidação, polling ou eventos de servidor.

## Organização

```text
src/
  app.vue                 # Shell Nuxt com NuxtPage
  pages/                  # Rotas Nuxt em inglês, delegando às views dos módulos
  plugins/                # Mavis, serviços por aplicação/requisição e payload público
  app/                    # Tema, composição e adaptadores HTTP injetados
  modules/
    cases/
      domain/             # Tipos, filtros e contrato CaseRepository
      data/               # Fixtures e adaptador mock
      composables/        # Consultas reativas e ciclo de vida
      presentation/       # Opções, contexto da busca na URL e ordenação
      components/         # Cards, filtros, ilustrações e orientação
      views/              # Páginas de busca e detalhe
      styles/
    home/                 # Apresentação e ilustração da rede
    help/                 # Orientação
    network/              # Configuração e prévia para parceiros
    review/               # Fila, sugestões com evidências, editor e histórico
    intake/               # Cadastro, validação, rascunhos e prévia pública
    sources/              # Gestão de fontes, responsabilidade, frequência e importações fictícias
    tips/                 # Relatos privados simulados e encaminhamento por etapas
    operations/           # Pendências derivadas, prazos e saúde de fontes fictícias
    simulation/           # Cenários de falha e permissões simuladas
  shared/
    components/           # Cabeçalho, rodapé, marca, diálogo e 404
    http/                 # Cliente Request/Response e diagnósticos sem conteúdo privado
    composables/          # Recursos assíncronos e clipboard
    styles/               # Tokens e base visual
contracts/                # Proposta OpenAPI para a integração futura
scripts/                  # Verificações de domínio e renderização
tests/                   # Jornadas Playwright e acessibilidade
```

Páginas compõem componentes. Composables coordenam estado e serviços. O domínio não depende de Vue. Os adaptadores implementam o contrato de acesso a dados; componentes não conhecem fixtures e não fazem `fetch`. Dependências são injetadas na criação de cada aplicação, sem estado de usuário em singletons.

Mavis alpha.6 fornece os controles, layouts e superfícies do Lume. A abertura usa uma timeline finita; a rede desenha conexões SVG com drawPath do Jolt RC.8 e responde à escolha da cidade. MStack organiza agrupamentos responsivos. Os cards e CTAs usam links reais Mavis com RouterLink. MReveal substituiu AppReveal/useRevealHeight; MDatePicker recebe rascunhos incompletos diretamente. O gerador oficial useMavisTokens substituiu o local. A busca combina animateLayout e entradas por identidade; cards respondem ao foco e ao ponteiro usando MotionSurface. O tema está em `src/app/theme.ts`, o logo original permanece em `public/brand/lume-original.png` e a assinatura continua “Gentileza gera gentileza”.

## Evolução para APIs e SSR

O Lume usa **Nuxt 4.6.3**, Vue 3.5.44 e Vue Router 5.4.0. As páginas públicas são renderizadas no servidor e hidratadas no navegador. A área `/organization` e suas subrotas usam renderização no cliente enquanto a operação é mock. Não há API de negócio, autenticação ou banco de dados.

O plugin `src/plugins/lume.ts` cria uma instância dos serviços para cada aplicação/requisição. Apenas resultados das consultas públicas são transferidos pelo payload Nuxt; o repositório completo, evidências, sugestões internas e histórico de revisão não são serializados. O adaptador `resource-hydration` mantém os módulos independentes do Nuxt e reutiliza o resultado inicial durante a hidratação. O tema começa em `light` nos dois lados. Os rascunhos usam um adaptador local injetado somente no cliente; o restante do estado mock reinicia ao recarregar.

Avisos indisponíveis e rotas desconhecidas retornam HTTP 404 em acessos diretos. Uma retirada durante a sessão elimina a projeção pública, mas não persiste no servidor mock após um recarregamento. SSR não altera essa limitação de persistência. SSR e hidratação foram exercitados no servidor Nitro `node-server`; SSG, outros presets e implantação pública não foram validados neste projeto.

O contrato proposto está em [contracts/lume-api.openapi.json](contracts/lume-api.openapi.json). Define projeções públicas e reservadas, paginação, parâmetros, erros, revisão esperada e idempotência. São 19 caminhos exercitados pelo transporte local, sem endpoint de negócio implantado. O mock testa repetição de comandos, conflito de versões e descarte de eventos antigos da rede. As respostas são comparadas com os schemas OpenAPI nos testes. Os endpoints marcados `x-demo-only` modelam ações exclusivas desta demonstração.

Para integrar a API:

1. Substitua o transporte local de `createDemoServices` por um transporte de rede autenticado. Os adaptadores de `CaseRepository`, `SourcesRepository`, `TipsRepository` e `NetworkRepository` já convertem as chamadas em Request/Response.
2. Preserve a injeção por aplicação/requisição pelo contrato `AppServices` no plugin Nuxt. O controle de simulação pertence apenas ao protótipo e deve ser removido da composição de produção.
3. Encaminhe versão esperada, chave de idempotência, erros de domínio e justificativa nas decisões.
4. Implemente autorização e isolamento no servidor; a interface não é uma barreira de segurança.
5. Substitua as notificações locais do repositório pelo mecanismo de revalidação escolhido.

Para conectar serviços reais, preserve a criação por requisição, transporte somente projeções autorizadas e implemente autenticação, isolamento, cache/invalidação e persistência no backend. A regra de renderização da organização pode ser reavaliada quando houver autenticação no servidor. Os controles de simulação são ferramentas do protótipo e não devem compor a aplicação de produção.

A projeção `PublicCase` usa uma lista explícita de campos; evidências e histórico ficam somente em `ReviewCase`. O mock é uma conveniência de desenvolvimento, não uma implementação de proteção de dados para produção.

Mavis Web/Core estão fixados na **release npm 0.1.0-alpha.6**, e Jolt em **0.1.0-rc.8**. A tag [`v0.1.0-alpha.6`](https://github.com/getcortexlabs/mavis-ui/releases/tag/v0.1.0-alpha.6) resolve para o commit `81b6b6b6e6576511755d6ee5a5943d9bcd66e09d`. `vendor/manifest.json` registra a procedência, e package-lock fixa as URLs e integridades do npm. Não há dependência de tarballs locais ou do checkout vizinho.

A migração substituiu o campo de data nativo, paginação manual, indicadores de etapa, cálculo do ponteiro, observação de viewport e transições/layout CSS pelas APIs equivalentes disponíveis. O domínio e a operação continuam inteiramente mock. Antes de cada troca de release, execute build, domínio, SSR, auditoria e navegador.

## Hospedagem e validação desta entrega

Destino planejado: **lume.getcortexlabs.com**. O repositório contém uma aplicação Nuxt/Nitro com servidor Node, não uma exportação estática. As páginas públicas usam SSR; `/organization/**`, `/embed` e `/screen` continuam renderizadas no cliente e com `no-store`. O backend de negócio ainda é mock: SSR não significa que as APIs reais já foram implementadas.

### Deploy no Orbit

Crie uma **aplicação web de repositório** no Orbit com:

| Configuração | Valor |
| --- | --- |
| Repositório | `https://github.com/getcortexlabs/lume.git` |
| Branch | `main` |
| Diretório | raiz do repositório |
| Estratégia | Build automático / Nuxt |
| Instalação | `npm ci` (detectado pelo lockfile) |
| Build | `npm run build` |
| Start | `node .output/server/index.mjs` |
| Porta | `3000` |
| Verificação de saúde HTTP | `/` |
| Ambiente | `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT=3000` |
| Domínio | `lume.getcortexlabs.com` |

O build automático do Orbit detecta a dependência `nuxt`, usa Node 22 e executa esse servidor em um contêiner no Kubernetes. Não selecionar **Arquivos estáticos** nem publicação por Space. O Orbit gerencia a imagem, os recursos do Kubernetes e o roteamento; não há manifests paralelos neste repositório. O domínio precisa ser associado à aplicação no Orbit, com o DNS correspondente.

Um push só dispara deploy automático depois que a aplicação estiver conectada ao repositório e esse comportamento estiver configurado no Orbit. Publicar o código no GitHub não comprova que o serviço ou o domínio já estejam no ar.

Para servir localmente o build SSR, execute `HOST=0.0.0.0 PORT=3000 npm start` após `npm run build`. O protótipo mantém `noindex,nofollow` enquanto contém exemplos. Rascunhos persistem apenas no navegador; outros estados mock podem ser reiniciados ao recarregar ou reiniciar a aplicação.


Nuxt, Jolt e os pacotes Mavis vêm do registry npm. O lockfile foi atualizado pelo npm. Não há alias ou vínculo de runtime com o repositório vizinho.

A validação de 2 de novembro de 2026 cobre **62 cenários em Chromium, Firefox e WebKit**: 184 execuções aprovadas e 2 ignoradas na suíte completa. Os dois ignorados são a leitura real do clipboard fora do Chromium. A nova jornada verifica a faixa ligada à rolagem, movimento reduzido e navegação de ida e volta. O redimensionamento dos avisos durante a entrada foi corrigido com origem fixa nos wrappers e passou na suíte completa. Build/tipos, domínio, SSR HTTP e auditoria de controles também passaram. A abertura e o encerramento foram inspecionados em desktop e celular; o servidor local responde na porta 5190.

As verificações incluem isolamento entre organizações e requisições, reinício com preservação de rascunhos, rejeição de gravações antigas, eventos idempotentes, atalhos, evidências, publicação/retirada, rotação contínua durante revalidação, expiração offline, redução de movimento e edição anterior à hidratação. Axe cobre as novas superfícies em 390 e 1280 px, além das jornadas anteriores em 390 e 1440 px. Essas verificações não substituem uma auditoria completa de acessibilidade ou testes em dispositivos físicos.

## Direção visual

A abertura usa fundo de papel, tipografia grande e uma rede gráfica interativa por cidade. O símbolo original aparece em uma composição de cartaz, sem brilho difuso. Título e cidades entram em sequência; o sublinhado é desenhado pelo Jolt. Avisos e formas de ajudar respondem ao mouse e ao teclado. “Gentileza gera gentileza” ganha uma seção própria com entrada por linha e uma faixa decorativa ligada à rolagem. As animações respeitam `prefers-reduced-motion` e liberam seus recursos na navegação.

## Adoção do Mavis

Consulte [o inventário e as lacunas revisadas do Mavis e Jolt](docs/mavis-adoption.md). `npm run audit:ui` contabiliza os componentes usados e verifica que controles HTML não sejam introduzidos fora de adaptadores explícitos. Nesta revisão são **27 tipos Mavis e 624 ocorrências estáticas, sem controles HTML nativos próprios**. AppDateInput adapta strings/rascunhos para os componentes de data Mavis; a implementação NativeDateInput foi removida. Isso não transforma a contagem em porcentagem do código da aplicação. A assinatura do Lume é “Gentileza gera gentileza”.
