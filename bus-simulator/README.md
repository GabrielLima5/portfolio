# Rota do Portfólio — o tour de ônibus pelo meu portfólio

Um simulador de motorista de ônibus em 3D que dobra como portfólio
interativo: você dirige pela cidade e, em cada cruzamento, encontra um
projeto real do portfólio — screenshot, descrição, tecnologias e links
pro código/site ao vivo. HTML + JS + Three.js, **projeto local comum**
(sem build step, sem framework, sem depender de internet).

> Este projeto agora vive dentro de `Portfólio Gabriel Lima/bus-simulator/`
> — é a base da seção **Tour 3D** do portfólio (ver o
> [README do portfólio](../README.md)), mas continua um projeto local
> comum, sem build step e sem depender do resto do site.

## Como jogar

- **W / ↑** — acelerar · **S / ↓** — frear/ré · **A / ←** e **D / →** — virar.
  **No celular/tablet**, botões na tela fazem a mesma coisa (aparecem
  sozinhos em qualquer tela sensível ao toque: ◀▶ pra virar, ▼▲ pra
  frear/acelerar).
- **Mova o mouse** pra olhar em volta do ônibus em 360° (frente, traseira,
  lados) — solta o mouse e a câmera volta sozinha pra atrás dele.
- **C** (ou o botão 🎥 no rodapé) alterna entre a câmera de 3ª pessoa
  (padrão, de fora) e a de 1ª pessoa, do banco do motorista — o mouse
  ainda olha em volta em 1ª pessoa, só que num alcance menor (~±78°, a
  cabeça virando pros vidros laterais, não uma órbita de 360°).
- Conforme você se aproxima de cada cruzamento — **mesmo sem parar,
  ainda em movimento** — o card daquele projeto aparece sozinho (e some
  quando você se afasta, dando lugar ao próximo). Uma placa "👆 Clique e
  veja" pulsando em cada outdoor também deixa claro que dá pra **clicar
  com o mouse em qualquer monumento**, mesmo de longe, pra abrir o card
  na hora, de qualquer um deles, em qualquer ordem.
- Parar certinho na faixa pintada (sem brusquidão) além de "abrir a
  porta" pra passageiros também soma a nota de precisão daquela parada.
  No Terminal, um jeito de entrar em contato — GitHub, e-mail ou LinkedIn.
- Nota final: pontualidade, suavidade de condução e precisão nas
  paradas — a física (câmbio automático, frenagem a ar, suspensão
  visual) é a mesma simulação "sem engine" da versão anterior do
  protótipo, sem mudanças.

## Estrutura do projeto

```
index.html          shell da página — HUD, telas, <link>/<script>
css/style.css        todo o CSS (HUD, telas, painel de revelação de projeto)
js/i18n.js           idioma do tour — ver "Idioma" abaixo
js/three.min.js      Three.js r128 (vendored, carregado localmente)
js/data.js           dados do portfólio — a ÚNICA fonte de conteúdo
js/game.js           física, cidade, monumentos, ônibus, HUD — tudo o resto
assets/fonts/        Baloo 2 + Nunito (.woff2, referenciadas por @font-face)
```

### Idioma

O tour não tem seletor de idioma próprio — ele herda a preferência
salva pelo seletor do site principal (`assets/js/modules/i18n.js`,
chave `gl-lang` no `localStorage`, mesma origem então acessível daqui).
Resolvido **uma única vez**, em `js/i18n.js`, carregado antes de
`data.js`/`game.js`: define `window.TOUR_LANG` ("pt" ou "en", "pt" se
não houver preferência salva), aplica a tradução no HTML estático
(`[data-i18n]`/`[data-i18n-attr]`) e expõe `T(chave, vars?)` pros
textos de UI gerados em `game.js` (mensagens, HUD, telas). Só suporta
PT/EN, como o site principal — se ele ganhar um 3º idioma, dá pra
copiar o bloco `pt`/`en` de `STRINGS` em `js/i18n.js` como base.

### Atualizando o conteúdo do portfólio

Tudo que é específico do portfólio (projetos, temas de cor, contato)
vive em **`js/data.js`** — nada na física, na cidade ou no HUD depende
do conteúdo de um projeto específico, então trocar/adicionar projetos
não exige tocar em `game.js`.

- `FEATURED_PROJECTS`: os 7 projetos em destaque, um por cruzamento, na
  ordem em que aparecem. Cada um tem `theme` (uma chave de
  `PROJECT_THEMES`, as mesmas paletas do seletor de tema do site real),
  `image` (screenshot como _data URI_ — ver abaixo), `desc`, `tech[]`,
  `github` e `live`.
- `OTHER_PROJECTS`: os projetos menores/acadêmicos, exibidos como totens
  decorativos no pátio da garagem (sem parada dedicada).
- `CONTACT_INFO`: nome, cargo e links exibidos no monumento do Terminal.

**Conteúdo bilíngue**: `desc` (de todo projeto), `role` (de
`CONTACT_INFO`) e `name` (quando o título muda de um idioma pro outro,
como em "Você é o bug"/"You are the glitch") são objetos `{ pt, en }`
em vez de string — resolvidos com `L(campo)` (`js/i18n.js`) conforme
`TOUR_LANG`. Campos que ficam iguais nos dois idiomas (nome de marca,
`tech[]`, `github`, `live`) continuam string simples; `L()` aceita os
dois formatos, então não precisa converter um projeto que não muda de
nome.

**Sobre as imagens**: os screenshots (e o logo, em `LOGO_IMAGE`) ficam
embutidos como _data URI_ (`data:image/jpeg;base64,...`) diretamente em
`js/data.js`, não como caminho de arquivo — isso evita qualquer
problema de carregar textura local via `file://` em navegadores mais
restritivos. Não há cópias locais dos arquivos-fonte (os originais já
vivem em `../assets/images/` no portfólio); se trocar um screenshot,
gere o novo data URI a partir do arquivo em `../assets/images/`
(por exemplo, com
`node -e "console.log('data:image/jpeg;base64,' + require('fs').readFileSync('caminho.jpg').toString('base64'))"`)
e cole no campo `image` do projeto correspondente.

Quer adicionar um 7º cruzamento? Adicione o projeto em
`FEATURED_PROJECTS` **e** um ponto de virada em `PATH_POINTS` +
uma distância em `STOP_DISTANCES` (em `game.js`) — o resto (monumento,
zona de parada, HUD, faixa neon do trecho) é gerado automaticamente a
partir dessas duas listas.

## Física do veículo

Sem mudanças desde a versão anterior — continua tudo escrito à mão, sem
physics engine (sem Cannon.js/Ammo/Rapier, sem Unity):

- **Direção**: modelo de bicicleta (entre-eixos + ângulo real das rodas
  dianteiras), com sub-esterçamento em alta velocidade.
- **Motor/câmbio**: 4 marchas automáticas com curva de torque simulada.
  Se ajustar `gearUpshiftSpeed`/`gearBaseAccel`, confira que cada
  marcha ainda supera o arrasto na sua própria velocidade de troca.
- **Frenagem**: freio de serviço com atraso de resposta + arrasto
  aerodinâmico/rolamento sempre atuando.
- **Suspensão visual**: mola-amortecedor dando pitch/roll no chassi ao
  acelerar/frear/curvar; rodas dianteiras esterçam, todas giram com a
  distância percorrida; faróis reais (SpotLight) + luzes de freio/ré.

## O que é novo nesta versão (tour do portfólio)

- Rota: 9 paradas (Garagem → 7 projetos, um por cruzamento →
  Terminal/contato), ~320m — trechos curtos de propósito, pra chegar
  rápido de um projeto a outro.
- Monumento 3D por projeto: outdoor com o screenshot real, título,
  chips de tecnologia flutuantes, farol-guia, aro neon no chão e uma
  placa "👆 Clique e veja" pulsando — tudo na cor de tema daquele
  projeto (as mesmas paletas do site real).
- Revelação por proximidade: o card completo do projeto **mais próximo**
  aparece sozinho conforme você se aproxima dele, mesmo em movimento —
  e some conforme você se afasta, dando lugar ao próximo. Funciona pra
  qualquer um dos 7 projetos, em qualquer ordem, parando ou não; fechar
  manualmente (✕) não reabre na hora — só na próxima aproximação.
  Independente disso, parar certinho na faixa pintada ainda soma a nota
  de precisão daquela parada e atualiza o card com a pontuação.
  Também dá pra clicar com o mouse em qualquer monumento, de qualquer
  distância, pra ver as informações na hora.
- Prévia de aproximação: um aviso discreto avisa qual projeto está
  chegando, antes de você alinhar o ônibus.
- Cidade noturna: céu em gradiente com lua e estrelas, prédios com
  janelas iluminadas (textura procedural), postes de luz, abrigos nas
  paradas, faixa neon ao longo do meio-fio que muda de cor por trecho
  (cor do próximo projeto adiante).
- Rota mais curta: trechos entre cruzamentos praticamente pela metade —
  chega mais rápido de um projeto a outro.
- Controles de toque: em celular/tablet, botões na tela (◀▶ vira,
  ▼▲ freia/acelera) aparecem automaticamente — a tela inicial já troca
  a legenda do teclado por essa dica. Os cards do HUD, o painel de
  revelação e as telas de início/resultado também encolhem e se
  reorganizam em telas pequenas, pra não ficar em cima dos botões.
- E-mail como terceira opção de contato no card do Terminal (junto com
  GitHub e LinkedIn).
- Câmera livre: mova o mouse pra orbitar em volta do ônibus e ver a
  frente, a traseira e os lados; o mouse também controla a altura da
  câmera. Solta o mouse e ela recentraliza atrás do ônibus sozinha.
- Câmera em 1ª pessoa: tecla **C** ou o botão 🎥 no rodapé alterna pra
  visão do banco do motorista, olhando pelo para-brisa — a carroceria
  do ônibus some da visão (não existe interior modelado), mas faróis e
  rodas continuam ativos normalmente.
- Projeto deixou de ser publicado como Artifact — agora é só um projeto
  local de arquivos estáticos, sem essa camada.

## Fora de escopo (como antes)

Múltiplas linhas/ônibus, tráfego, pedestres, clima, som, multiplayer,
mobile — não implementados de propósito, pra manter o protótipo
focado.
