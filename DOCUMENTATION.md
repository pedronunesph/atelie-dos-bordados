# Ateliê do Bordado — Documentação do Site

Site institucional de uma página (landing page) para o Ateliê do Bordado, ateliê de
bordados infantis personalizados em Governador Valadares/MG. É uma "vitrine digital"
sem carrinho de compras — todo pedido/orçamento é direcionado para WhatsApp.

- **URL de produção:** https://www.ateliedobordado.com.br/
- **Repositório:** https://github.com/pedronunesph/atelie-dos-bordados
- **Hospedagem:** Vercel (deploy automático a cada push em `master`, se o projeto
  estiver conectado ao repositório do GitHub)
- **Stack:** HTML + CSS + JavaScript puro (sem build step, sem framework, sem bundler)

---

## 1. Estrutura de arquivos

```
index.html            # única página do site (todo o conteúdo/seções)
css/styles.css         # todo o CSS do site
js/config.js           # configuração central (WhatsApp, Instagram, endereço, portfólio, textos)
js/main.js              # lógica de UI (menu, portfólio, lightbox, FAQ, mapa, navegação)
js/animations.js       # sistema de animações GSAP + ScrollTrigger
img/                    # fotos do portfólio, logo, ícones/favicons
robots.txt, sitemap.xml, llms.txt   # SEO e descoberta por buscadores/IAs
scripts/crop-logo.mjs   # utilitário local (não roda em produção)
.claude/                # configuração do assistente (Claude Code)
react-app/              # pasta não utilizada em produção (ver seção 8)
```

Não há processo de build: os arquivos em `css/` e `js/` são servidos exatamente como
estão. Bibliotecas externas (GSAP, ScrollTrigger, SplitType, Leaflet) são carregadas
via CDN (`<script>`/`<link>` no final do `index.html`).

### Cache-busting

Todo `<link>`/`<script>` local usa uma query string de versão, por exemplo:

```html
<link rel="stylesheet" href="css/styles.css?v=48" />
<script src="js/animations.js?v=16"></script>
```

**Sempre que editar `styles.css`, `main.js` ou `animations.js`, incremente o `?v=N`
correspondente no `index.html`** — sem isso, navegadores com cache não vão baixar a
versão nova do arquivo.

---

## 2. Configuração do negócio (`js/config.js`)

Único arquivo que deveria precisar de edição frequente sem tocar em HTML/CSS/JS de
verdade. Controla:

| Campo | Descrição |
|---|---|
| `businessName`, `businessAddress`, `businessHours` | Preenchidos automaticamente em todos os `[data-business-*]` do HTML |
| `whatsappNumber` | Número usado em todos os links de WhatsApp (formato `55DDDNUMERO`) |
| `instagramUrl` | Usado em todos os links de Instagram |
| `categories` | Filtros exibidos acima do grid do portfólio |
| `portfolioItems` | Cada peça do portfólio: imagem, categoria e texto alternativo (`alt`) |
| `messages` | Mensagem pré-preenchida do WhatsApp, uma por seção/origem do clique (`data-wa="..."`) |

Para trocar/adicionar fotos do portfólio: colocar o arquivo em `img/`, adicionar uma
entrada em `portfolioItems` e apontar `image` para o caminho do arquivo.

---

## 3. Seções da página (`index.html`)

| Âncora (`id`) | Seção | Observação |
|---|---|---|
| `#topo` | Hero | Duas fotos lado a lado + headline + CTAs |
| `#identificacao` | Nossa história | Cards de ocasiões emocionais (enxoval, batizado, etc.) |
| `#beneficios` | Diferenciais | Seção de fundo escuro |
| `#portfolio` | Portfólio | Grid dinâmico (montado via JS a partir de `config.js`), com filtro por categoria e lightbox |
| `#personalizacao` | Personalização | Nomes de exemplo + tags de opções de personalização |
| `#como-funciona` | Como encomendar | 4 passos, com linha conectando-os no mobile |
| `#ocasioes` | Ideias para presentear | Grid de fotos com legenda |
| `#sobre` | Sobre o Ateliê | Texto institucional + foto |
| `#localizacao` | Nossa loja | Mapa (Leaflet) com "viagem" cinematográfica até o endereço real |
| `#faq` | Dúvidas frequentes | Accordion |
| `#contato` (`.cta-final`) | Chamada final | Último CTA antes do rodapé |

O menu (`#main-nav`) e o rodapé/CTAs flutuantes (`.floating-whatsapp`,
`.mobile-cta-bar`, `.back-to-top`) ficam fora do `<main>`, no `<header>`/final do
`<body>`.

---

## 4. `js/main.js` — lógica de UI

Responsável por tudo que não é animação decorativa:

- **Links de WhatsApp/Instagram** (`bindWhatsappLinks`, `bindInstagramLinks`) — preenche
  todo elemento `[data-wa]`/`[data-ig]` a partir de `config.js`.
- **Mapa** (`initLocationMap`) — geocodifica o endereço via Nominatim (OpenStreetMap) e
  cria o mapa Leaflet. Decide, na hora, se o navegador suporta a "viagem" cinematográfica
  (GSAP carregado + sem `prefers-reduced-motion`); se não suportar, o mapa já nasce
  aberto direto no endereço final, sempre funcional.
- **Portfólio** (`renderPortfolio`) — monta o grid e os botões de filtro dinamicamente a
  partir de `config.js`; delega a animação de entrada/filtro para
  `window.AtelieAnimations` (ver seção 5) quando disponível.
- **Lightbox** (`openLightbox`/`closeLightbox`/`bindLightbox`) — visualizador de imagem
  em tela cheia, com navegação por teclado (setas/Esc).
- **Logo em destaque, FAQ, menu mobile, header com sombra ao rolar, back-to-top,
  reveal simples (`data-reveal`/`data-reveal-group`)** — comportamentos de UI
  independentes de GSAP (funcionam mesmo se o GSAP falhar ao carregar).

### Contrato `window.AtelieAnimations`

`main.js` e `animations.js` se comunicam por uma pequena interface global, porque
`main.js` é quem sabe **quando** os elementos dinâmicos (portfólio, mapa) realmente
existem no DOM, e `animations.js` é quem sabe **como** animá-los:

```js
window.AtelieAnimations = {
  initPortfolioAnimations(),        // chamada por main.js logo após montar o grid
  filterPortfolio(grid, applyFn),   // chamada no clique de um filtro
  toggleFaq(item, isOpen),          // chamada no clique de uma pergunta do FAQ
};
window.AtelieMapReady;              // Promise<{map, marker, target, cinematic}> exposta por main.js
```

Se o GSAP não carregar (CDN fora do ar, bloqueio de rede), `window.AtelieAnimations`
fica `undefined`/incompleto e `main.js` sempre verifica antes de usar — o site
continua 100% funcional, só sem as animações.

---

## 5. `js/animations.js` — sistema de animações (GSAP + ScrollTrigger)

Todo o arquivo é uma IIFE que primeiro checa se GSAP/ScrollTrigger carregaram e se o
usuário pediu `prefers-reduced-motion: reduce`; se qualquer verificação falhar, as
funções relevantes retornam cedo e o conteúdo permanece visível normalmente (nunca
há um elemento "preso" invisível por falta de JS).

| Função | O que anima |
|---|---|
| `initHero()` | Timeline de entrada do Hero (fotos, headline por linha via SplitType, badge, CTAs) + paralaxe de scroll em camadas próprias (`.hero-parallax-layer`) |
| `initSectionReveal()` | Reveal (máscara + fade + slide) da seção "Nossa história" ao entrar na tela |
| `initSewing()` | Divisor de costura entre Ocasiões e Sobre — agulha segue um path SVG real, fio e pontos aparecem/desaparecem em sincronia com o scroll (100% reversível) |
| `initPortfolioAnimations()` | Entrada com máscara/stagger do grid do portfólio (exposta em `window.AtelieAnimations`) |
| `initPersonalizacao()` | Nomes de exemplo "caindo" em cascata + tags com stagger |
| `initStepsThread()` | Linha conectando os 4 passos de "Como encomendar" (mobile) |
| `initAbout()` | Reveal com máscara + leve paralaxe na foto da seção Sobre |
| `initCtaFinal()` | Linhas de "costura" desenhando-se na chamada final |
| `initMagneticButtons()` | Efeito magnético leve nos botões (desktop) |
| `initBenefitCards()` | Brilho seguindo o cursor nos cards de diferenciais (desktop) |
| `initIdentificationTilt()` | Tilt 3D nos cards de "Nossa história" seguindo o cursor (desktop) |
| `initFaqAnimations()` / `toggleFaq()` | Altura do accordion do FAQ animada via GSAP |
| `initScrollThread()` | Barra de progresso de leitura na lateral (desktop) |
| `initActiveNavIndicator()` | Sublinhado "costurado" que desliza até o link do menu correspondente à seção visível (desktop) |
| `initHeadings()` | Reveal por linha (SplitType) dos títulos de seção |
| `initCustomCursor()` | Cursor customizado (desktop com ponteiro fino) |
| `initMapJourney()` | Sequência de `flyTo` no mapa Leaflet (mundo → Brasil → MG → loja), acionada por scroll, uma única vez |

### Convenções usadas em todo o arquivo

- **Progresso puro do scroll como única fonte de verdade**: divisores como a costura
  calculam tudo (posição, rotação, opacidade) a partir do `progress` (0–1) do
  `ScrollTrigger`, nunca de eventos separados de entrada/saída — por isso revertem
  perfeitamente ao rolar para cima.
- **Sem disputa de propriedade entre GSAP e CSS**: sempre que um elemento tem
  `:hover`/`transition` no CSS e também é animado por GSAP, uma das duas fica
  totalmente responsável por aquela propriedade (nunca as duas ao mesmo tempo).
- **Camadas separadas para entrada vs. paralaxe**: elementos que têm uma animação de
  entrada (timeline, uma vez) e depois uma de scroll (scrub, contínua) usam um
  wrapper dedicado para a segunda, evitando que uma sobrescreva a outra.
- **`gsap.matchMedia()`** para variar o efeito por tamanho de tela (ex.: paralaxe do
  Hero é mais forte no desktop, reduzida no tablet e desligada em telas pequenas).
- **`prefers-reduced-motion`** é checado uma vez no topo do arquivo (`reduceMotion`)
  e respeitado individualmente por cada função.

---

## 6. Bibliotecas externas (via CDN)

| Biblioteca | Uso |
|---|---|
| GSAP 3.12.5 + ScrollTrigger | Todo o sistema de animações |
| SplitType 0.3.4 | Divide títulos em linhas para o efeito de reveal |
| Leaflet 1.9.4 | Mapa da seção "Nossa loja" |
| Google Fonts (Playfair Display + Inter) | Tipografia |

Nenhuma dessas é instalada via `npm` — são `<script>`/`<link>` diretos no
`index.html`. Se uma delas mudar de versão, atualizar a URL do CDN ali.

---

## 7. SEO e descoberta

- `robots.txt`, `sitemap.xml` — configuração padrão de indexação.
- `llms.txt` — resumo do negócio para assistentes de IA/LLMs que buscarem informação
  sobre o ateliê (endereço, horário, observação de que não há checkout online).
- Dados estruturados (`application/ld+json`) no `<head>` do `index.html`: `Store` (endereço,
  geolocalização, horários) e `FAQPage` (perguntas do FAQ).

---

## 8. Notas e pontos de atenção

- **`react-app/`**: existe uma pasta com um scaffold React/Vite no repositório,
  **não utilizada em produção** — o site publicado é 100% o `index.html` estático
  descrito aqui. Ela não está rastreada pelo git (`git status` mostra como untracked).
  Se não for mais necessária, pode ser removida; se for um experimento em andamento,
  vale mantê-la fora do commit principal para não confundir o histórico.
- **Ambiente de teste**: ao testar localmente com ferramentas automatizadas de
  navegador headless, `requestAnimationFrame` pode não avançar enquanto a aba está em
  segundo plano — isso pode fazer animações baseadas em timeline (não em scroll)
  parecerem "travadas" nesse contexto específico, mas funcionam normalmente em uso
  real (aba em primeiro plano). Não é um bug do site.
- **Menu desktop**: os ícones de Instagram/WhatsApp (`.nav-actions`) podem quebrar
  para uma segunda linha em algumas larguras de tela, dependendo do espaço
  disponível — comportamento pré-existente, não afeta a legibilidade dos links.

---

## 9. Como rodar localmente

Não há dependências para instalar. Basta servir a pasta como arquivos estáticos, por
exemplo:

```bash
npx serve .
```

e abrir `http://localhost:3000` (ou a porta indicada). Qualquer servidor estático
simples funciona (não há rotas de backend nem variáveis de ambiente).

## 10. Deploy

```bash
git add <arquivos alterados>
git commit -m "mensagem"
git push origin master
```

Se o repositório estiver conectado a um projeto Vercel, o push para `master` dispara
o deploy automaticamente.
