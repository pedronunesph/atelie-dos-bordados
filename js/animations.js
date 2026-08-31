/**
 * Ateliê do Bordado — sistema de animações (GSAP + ScrollTrigger + SplitType)
 *
 * Este arquivo NÃO substitui js/main.js — ele complementa. main.js continua
 * responsável por: navegação, WhatsApp/Instagram, portfólio (render + filtro +
 * lightbox), FAQ, mapa, menu mobile e o reveal simples (data-reveal) usado na
 * maior parte do conteúdo estático.
 *
 * Aqui vivem apenas as animações que precisam de GSAP/ScrollTrigger: a
 * "história em movimento" do site — tesoura, costura, entrada do Hero,
 * paralaxe, portfólio (microinterações), personalização, linha do processo
 * "Como encomendar", cards de benefícios, botões e o cursor customizado.
 *
 * Linguagem de movimento: linha, tecido, agulha, ponto — nada de fade genérico
 * espalhado por toda a página. Ritmo: forte / calmo alternando por seção.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (!hasGsap) {
    // GSAP não carregou (bloqueio de rede, CDN indisponível etc.). O conteúdo
    // já está visível por padrão via HTML/CSS normais e o reveal simples de
    // main.js continua funcionando — a página não fica quebrada sem GSAP.
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power2.out" });

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Pequena interface controlada entre main.js e este arquivo: o portfólio e
  // o mapa são criados/atualizados em main.js (que é quem sabe QUANDO os
  // elementos existem de verdade), e aqui vivem só as animações sobre eles.
  window.AtelieAnimations = window.AtelieAnimations || {};

  /* =========================================================
     1. HERO — timeline de entrada + paralaxe no scroll
     ========================================================= */
  function initHero() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const items = [...hero.querySelectorAll(".hero-media-item")];
    const doodle = hero.querySelector(".hero-doodle-arrow");
    const badge = hero.querySelector(".hero-badge");
    const eyebrow = hero.querySelector(".hero-text > .section-eyebrow");
    const h1 = hero.querySelector(".hero-text h1");
    const lede = hero.querySelector(".hero-lede");
    const actions = hero.querySelector(".hero-actions");
    const trust = hero.querySelector(".hero-trust");

    if (reduceMotion) return; // conteúdo já visível normalmente; não há necessidade de animar entrada

    // Headline dividida por linha (não por letra) — a palavra em destaque
    // (.accent-gold) permanece intacta dentro da própria linha.
    let splitLines = null;
    if (window.SplitType && h1) {
      try {
        const split = new SplitType(h1, { types: "lines", lineClass: "split-line" });
        splitLines = split.lines || null;
        if (splitLines) {
          splitLines.forEach((line) => {
            const wrap = document.createElement("span");
            wrap.className = "split-line-wrap";
            line.parentNode.insertBefore(wrap, line);
            wrap.appendChild(line);
          });
        }
      } catch (err) {
        splitLines = null; // se o SplitType falhar por algum motivo, a timeline segue sem ele
      }
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1) cada foto: escondida atrás de uma "janela" (clip-path) + leve escala.
    //    A primeira sobe alguns pixels; a segunda entra lateralmente — ambas
    //    ficam lado a lado, totalmente visíveis, nenhuma cobre a outra.
    items.forEach((item, i) => {
      const rot = parseFloat(getComputedStyle(item).getPropertyValue("--rot")) || 0;
      item.dataset.rot = rot;
      gsap.set(item, {
        opacity: 0,
        y: 34,
        x: i === 1 ? 26 : 0,
        scale: 0.94,
        rotation: 0,
        clipPath: "inset(14% 14% 14% 14% round 6px)",
      });
    });

    if (items[0]) {
      tl.to(items[0], { opacity: 1, y: 0, scale: 1, rotation: items[0].dataset.rot, clipPath: "inset(0% round 0px)", duration: 0.9 }, 0.05);
    }
    if (doodle) { gsap.set(doodle, { opacity: 0, scale: 0.6 }); tl.to(doodle, { opacity: 0.85, scale: 1, duration: 0.5 }, 0.35); }
    if (items[1]) {
      tl.to(items[1], { opacity: 1, x: 0, y: 0, scale: 1, rotation: items[1].dataset.rot, clipPath: "inset(0% round 0px)", duration: 0.9 }, 0.3);
    }

    if (badge) { gsap.set(badge, { opacity: 0, y: 10 }); tl.to(badge, { opacity: 1, y: 0, duration: 0.5 }, 0.55); }
    if (eyebrow) { gsap.set(eyebrow, { opacity: 0, y: 10 }); tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 }, 0.65); }

    if (splitLines && splitLines.length) {
      gsap.set(splitLines, { yPercent: 115, opacity: 0 });
      tl.to(splitLines, { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.09 }, 0.72);
    } else if (h1) {
      gsap.set(h1, { opacity: 0, y: 16 });
      tl.to(h1, { opacity: 1, y: 0, duration: 0.6 }, 0.72);
    }

    if (lede) { gsap.set(lede, { opacity: 0, y: 12 }); tl.to(lede, { opacity: 1, y: 0, duration: 0.5 }, 1.05); }
    if (actions) { gsap.set(actions, { opacity: 0, y: 12 }); tl.to(actions, { opacity: 1, y: 0, duration: 0.5 }, 1.15); }
    if (trust) { gsap.set(trust, { opacity: 0, y: 10 }); tl.to(trust, { opacity: 1, y: 0, duration: 0.45 }, 1.25); }

    // 2) balanço contínuo da foto da frente — controlado pelo GSAP (não CSS)
    //    para não haver duas fontes disputando a propriedade transform.
    if (items[1]) {
      tl.call(() => {
        gsap.to(items[1], {
          rotation: `-=3`,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }

    // 3) paralaxe leve no scroll — cada camada numa velocidade diferente.
    //    IMPORTANTE: a paralaxe nunca anima os mesmos elementos/propriedades
    //    que a entrada acima já controla — fotos usam um wrapper próprio
    //    (.hero-parallax-layer) só para isso, e o texto usa o container
    //    .hero-text (nunca tocado pela entrada, que só anima seus filhos
    //    individualmente). Assim as duas animações nunca disputam a mesma
    //    propriedade no mesmo elemento.
    //    matchMedia: completa no desktop, reduzida no tablet, desligada em
    //    telas muito pequenas (custo de scroll não compensa em aparelhos
    //    fracos nem numa faixa de tela onde o efeito quase não se percebe).
    const parallaxLayers = [...hero.querySelectorAll(".hero-parallax-layer")];
    const heroText = hero.querySelector(".hero-text");

    const mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: "(min-width: 900px)",
        isTablet: "(min-width: 480px) and (max-width: 899px)",
        isSmallPhone: "(max-width: 479px)",
      },
      (context) => {
        const { isDesktop, isSmallPhone } = context.conditions;
        if (isSmallPhone) return; // tela pequena: sem paralaxe de scroll, só a entrada

        const rate1 = isDesktop ? -36 : -14;
        const rate2 = isDesktop ? -64 : -22;
        const scrollCfg = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 };

        if (parallaxLayers[0]) {
          gsap.to(parallaxLayers[0], { y: rate1, scale: 1.04, ease: "none", scrollTrigger: scrollCfg });
        }
        if (parallaxLayers[1]) {
          gsap.to(parallaxLayers[1], { y: rate2, scale: 1.05, ease: "none", scrollTrigger: scrollCfg });
        }
        if (doodle && isDesktop === false) {
          // a seta já é escondida em telas ≥900px via CSS; na faixa em que
          // aparece, ganha uma terceira camada de profundidade, bem discreta.
          gsap.to(doodle, { y: -10, ease: "none", scrollTrigger: scrollCfg });
        }
        if (heroText) {
          gsap.to(heroText, {
            y: isDesktop ? -18 : -8,
            ease: "none",
            scrollTrigger: scrollCfg,
          });
        }
      }
    );
  }

  /* =========================================================
     2. REVEAL DE SEÇÃO — "Nossa história" — máscara + fade + leve slide ao
     entrar na tela. Substitui a antiga animação de tesoura/tecido: mais
     simples, sem metáfora, sem risco visual — só presença discreta no ponto
     onde a página começa a contar a história do ateliê.
     ========================================================= */
  function initSectionReveal() {
    const section = document.getElementById("identificacao");
    if (!section || reduceMotion) return;
    const target = section.querySelector(".container");
    if (!target) return;

    gsap.set(target, { opacity: 0, y: 22, clipPath: "inset(8% round 4px)" });
    ScrollTrigger.create({
      trigger: section,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(target, {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% round 0px)",
          duration: 0.85,
          ease: "power3.out",
        }),
    });
  }

  /* =========================================================
     3. COSTURA — .sewing-divider — uma costura de verdade sendo feita,
     não um ícone seguindo uma linha. Três elementos distintos, cada um
     com seu papel:
       • .sewing-guide  — trajetória discreta, sempre visível por inteiro
       • .sewing-thread — pequeno trecho de fio, sempre junto da agulha
       • .sewing-stitches — pontos que ficam no tecido, atrás da agulha
     Tudo é função pura do progresso do scroll (0→1), por isso reverte
     perfeitamente ao subir a página. Funciona como transição entre
     Ocasiões e Sobre — o fio "termina" bem perto da próxima seção.
     ========================================================= */
  function initSewing() {
    const divider = document.querySelector(".sewing-divider");
    if (!divider) return;

    const guide = divider.querySelector(".sewing-guide");
    const thread = divider.querySelector(".sewing-thread");
    const needle = divider.querySelector(".sewing-needle");
    const stitchesGroup = divider.querySelector(".sewing-stitches");
    const fabricFlex = divider.querySelector(".sewing-fabric-flex");
    if (!guide || !needle) return;

    const pathLength = guide.getTotalLength();
    const viewBox = guide.ownerSVGElement.viewBox.baseVal;

    // Ângulo "de fábrica" do corpo da agulha no próprio SVG (tip → olho),
    // usado para realinhar a agulha com a tangente real do caminho.
    const NEEDLE_BASE_ANGLE = 49;
    const STITCH_COUNT = 22;

    function toPixels(pt, w, h) {
      return { x: (pt.x / viewBox.width) * w, y: (pt.y / viewBox.height) * h };
    }

    // Pontos de costura pré-calculados ao longo do caminho real (SVG),
    // para "aparecerem atrás" da agulha conforme ela avança.
    const stitches = [];
    if (stitchesGroup) {
      stitchesGroup.innerHTML = "";
      for (let i = 1; i < STITCH_COUNT; i++) {
        const t = i / STITCH_COUNT;
        const p = guide.getPointAtLength(t * pathLength);
        const p2 = guide.getPointAtLength(Math.min(pathLength, t * pathLength + 1));
        const angle = Math.atan2(p2.y - p.y, p2.x - p.x);
        const nx = Math.cos(angle + Math.PI / 2) * 4.2;
        const ny = Math.sin(angle + Math.PI / 2) * 4.2;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p.x - nx);
        line.setAttribute("y1", p.y - ny);
        line.setAttribute("x2", p.x + nx);
        line.setAttribute("y2", p.y + ny);
        line.style.opacity = "0";
        stitchesGroup.appendChild(line);
        stitches.push({ el: line, t });
      }
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function render(progress) {
      const w = divider.offsetWidth;
      const h = divider.offsetHeight;
      const here = progress * pathLength;

      // Fase dentro do intervalo do ponto atual (0→1) — sincroniza o
      // movimento da agulha com o ritmo real dos pontos, não com um
      // seno genérico desconectado da costura.
      const rawPhase = (progress * STITCH_COUNT) % 1;
      const settleK = Math.max(0, Math.min(1, (progress - 0.95) / 0.05));

      // avança → inclina → entra no tecido → volta para cima → puxa o fio → repete
      const dip = lerp(Math.sin(rawPhase * Math.PI) * 3.2, -2.5, settleK);
      const tilt =
        rawPhase < 0.5 ? lerp(-8, 5, rawPhase * 2) : lerp(5, -6, (rawPhase - 0.5) * 2);
      const tiltSettled = lerp(tilt, -10, settleK);

      const delta = Math.min(4, pathLength * 0.01);
      const p0 = guide.getPointAtLength(Math.max(0, here - delta));
      const p1 = guide.getPointAtLength(Math.min(pathLength, here + delta));
      const tangentDeg = Math.atan2(p1.y - p0.y, p1.x - p0.x) * (180 / Math.PI);

      const pointPx = toPixels(guide.getPointAtLength(here), w, h);
      const needleY = pointPx.y + (dip / viewBox.height) * h;

      gsap.set(needle, {
        xPercent: -15,
        yPercent: -85,
        x: pointPx.x,
        y: needleY,
        rotation: tangentDeg + NEEDLE_BASE_ANGLE + tiltSettled,
      });

      // Fio: um trecho curto sempre junto da agulha, nunca o trajeto inteiro.
      if (thread) {
        const tailFrac = 0.045;
        const t1 = progress;
        const t0 = Math.max(0, progress - tailFrac);
        const N = 5;
        let d = "";
        for (let i = 0; i <= N; i++) {
          const t = lerp(t0, t1, i / N);
          const p = guide.getPointAtLength(t * pathLength);
          const sag = Math.sin((i / N) * Math.PI) * 2.2; // leve tensão/curvatura
          d += `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${(p.y + sag).toFixed(1)} `;
        }
        thread.setAttribute("d", d.trim());
        gsap.set(thread, { opacity: progress > 0.004 ? 1 : 0 });
      }

      // Tecido reage minimamente bem perto de onde a agulha está descendo.
      if (fabricFlex) {
        const squish = 1 - Math.abs(Math.sin(rawPhase * Math.PI)) * 0.015 * (1 - settleK);
        gsap.set(fabricFlex, { x: pointPx.x - 25, scaleY: squish });
      }

      stitches.forEach(({ el, t }) => {
        el.style.opacity = t <= progress - 0.01 ? "1" : "0";
      });
    }

    if (reduceMotion) {
      stitches.forEach(({ el }) => (el.style.opacity = "1"));
      render(1);
      return;
    }

    render(0);

    const isMobile = window.matchMedia("(max-width: 699px)").matches;

    ScrollTrigger.create({
      trigger: divider,
      start: "top 85%",
      end: isMobile ? "+=550" : "+=950",
      scrub: 0.9,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
  }

  /* =========================================================
     4. PORTFÓLIO — entrada com máscara + hover sofisticado (desktop)

     O grid (#portfolio-grid) é montado dinamicamente por main.js — por isso
     esta função NUNCA roda sozinha em DOMContentLoaded (o grid ainda estaria
     vazio). Ela é exposta em window.AtelieAnimations.initPortfolioAnimations
     e chamada por main.js logo depois de inserir os cards no DOM. É segura
     de chamar mais de uma vez: cada peça só é processada uma única vez
     (marcada com [data-anim-ready]), então trocar de categoria não duplica
     ScrollTriggers nem listeners de hover.
     ========================================================= */
  function initPortfolioAnimations() {
    const grid = document.getElementById("portfolio-grid");
    if (!grid) return;

    const items = [...grid.querySelectorAll(".portfolio-item:not([data-anim-ready])")];
    if (!items.length) return;
    items.forEach((item) => item.setAttribute("data-anim-ready", "true"));

    if (reduceMotion) {
      gsap.set(items, { clearProps: "all" });
    } else {
      // Entrada com presença: máscara fechada + leve escala + queda sutil,
      // revelados com stagger — sem depender de nenhuma classe CSS externa.
      gsap.set(items, { opacity: 0, y: 46, scale: 0.94, clipPath: "inset(16% round 6px)" });

      ScrollTrigger.batch(items, {
        start: "top 92%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            clipPath: "inset(0% round 0px)",
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.08,
          }),
        // Ao subir de volta, uma sensação discreta e reversível de movimento —
        // não esconde a peça de novo, só a "recolhe" ligeiramente.
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0.85,
            y: 10,
            scale: 0.985,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.03,
          }),
      });
    }

    if (!isFinePointer) return; // hover sofisticado é só para desktop com mouse

    items.forEach((item) => {
      const img = item.querySelector("img");
      const label = document.createElement("span");
      label.className = "portfolio-view-label";
      label.textContent = "Ver peça";
      label.setAttribute("aria-hidden", "true");
      item.appendChild(label);

      // Importante: o zoom no hover (CSS .portfolio-item img:hover) também mexe em
      // `transform`. Para não haver disputa entre CSS e GSAP pela mesma propriedade,
      // a escala passa a ser controlada aqui também via GSAP assim que o JS carrega.
      const quickX = gsap.quickTo(label, "x", { duration: 0.35, ease: "power3.out" });
      const quickY = gsap.quickTo(label, "y", { duration: 0.35, ease: "power3.out" });
      const quickImgX = gsap.quickTo(img, "x", { duration: 0.5, ease: "power3.out" });
      const quickImgY = gsap.quickTo(img, "y", { duration: 0.5, ease: "power3.out" });
      const quickImgScale = gsap.quickTo(img, "scale", { duration: 0.4, ease: "power3.out" });

      item.addEventListener("mouseenter", () => {
        item.classList.add("is-hovered");
        quickImgScale(1.04);
      });
      item.addEventListener("mouseleave", () => {
        item.classList.remove("is-hovered");
        quickImgX(0);
        quickImgY(0);
        quickImgScale(1);
      });
      item.addEventListener("mousemove", (e) => {
        const rect = item.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        quickX(relX);
        quickY(relY);
        // A imagem acompanha o cursor de forma extremamente discreta (efeito "magnético" leve).
        const offsetX = ((relX / rect.width) - 0.5) * 10;
        const offsetY = ((relY / rect.height) - 0.5) * 10;
        quickImgX(offsetX);
        quickImgY(offsetY);
      });
    });
  }

  /* Transição de filtro: peças atuais recolhem (opacity+scale), o DOM é então
     atualizado (applyFn — display none/"" por categoria, feito em main.js) e
     as peças que ficam visíveis entram novamente com stagger. */
  function filterPortfolio(grid, applyFn) {
    if (!grid || typeof applyFn !== "function") return;
    if (reduceMotion) {
      applyFn();
      return;
    }
    const current = [...grid.querySelectorAll(".portfolio-item")];
    gsap.to(current, {
      opacity: 0,
      scale: 0.96,
      duration: 0.22,
      ease: "power2.out",
      stagger: 0.015,
      onComplete: () => {
        applyFn();
        const visible = [...grid.querySelectorAll(".portfolio-item")].filter((el) => el.style.display !== "none");
        gsap.fromTo(
          visible,
          { opacity: 0, scale: 0.94, y: 14 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 }
        );
      },
    });
  }

  window.AtelieAnimations.initPortfolioAnimations = initPortfolioAnimations;
  window.AtelieAnimations.filterPortfolio = filterPortfolio;

  /* =========================================================
     5. PERSONALIZAÇÃO — nomes revelados por linha + fio conectando as tags
     ========================================================= */
  function initPersonalizacao() {
    const section = document.getElementById("personalizacao");
    if (!section || reduceMotion) return;

    const names = [...section.querySelectorAll(".sample-name")];
    const tags = [...section.querySelectorAll(".tag")];
    const visual = section.querySelector(".customization-visual");

    if (names.length) {
      // Cada nome "cai" de cima e pousa em sequência conforme o scroll avança
      // pela seção — não é um stagger de entrada único, é uma queda em cascata
      // controlada pelo progresso do scroll (reversível ao subir a página).
      names.forEach((el, i) => {
        gsap.set(el, { opacity: 0, y: -46, rotation: i % 2 === 0 ? -5 : 5 });
      });
      gsap.timeline({
        scrollTrigger: {
          trigger: visual || section,
          start: "top 85%",
          end: "top 25%",
          scrub: 0.7,
        },
      }).to(names, {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.45,
      }, 0);
    }

    if (tags.length) {
      gsap.set(tags, { opacity: 0, y: 10, scale: 0.9 });
      ScrollTrigger.create({
        trigger: tags[0].parentElement,
        start: "top 85%",
        once: true,
        onEnter: () =>
          gsap.to(tags, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1.6)",
          }),
      });
    }
  }

  /* =========================================================
     6. "COMO ENCOMENDAR" — fio conectando as 4 etapas (mobile: coluna única)
     Implementado com uma linha 100% CSS (top/bottom fixos, sem medir
     coordenadas de elementos em JS) para nunca desalinhar dos números —
     o GSAP só controla o `scaleY`, nunca a posição.
     ========================================================= */
  function initStepsThread() {
    const stepsList = document.querySelector(".steps");
    if (!stepsList) return;
    const steps = [...stepsList.querySelectorAll(".step")];
    if (!steps.length) return;

    const line = document.createElement("span");
    line.className = "steps-thread-line";
    line.setAttribute("aria-hidden", "true");
    stepsList.appendChild(line);

    if (reduceMotion) {
      line.style.transform = "scaleY(1)";
      steps.forEach((s) => s.classList.add("is-active"));
      return;
    }

    function render(progress) {
      line.style.transform = `scaleY(${progress})`;
      steps.forEach((step, i) => {
        const threshold = i / (steps.length - 1);
        step.classList.toggle("is-active", progress >= threshold - 0.05);
      });
    }

    render(0);

    ScrollTrigger.create({
      trigger: stepsList,
      start: "top 75%",
      end: "bottom 60%",
      scrub: 0.7,
      onUpdate: (self) => render(self.progress),
    });
  }

  /* =========================================================
     7. SOBRE — reveal por máscara + leve paralaxe na foto
     ========================================================= */
  function initAbout() {
    const section = document.getElementById("sobre");
    if (!section || reduceMotion) return;
    const img = section.querySelector(".about-media img");
    if (!img) return;

    gsap.set(img, { scale: 1.08, clipPath: "inset(6% round 4px)" });
    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      once: true,
      onEnter: () => gsap.to(img, { scale: 1, clipPath: "inset(0% round 0px)", duration: 1, ease: "power3.out" }),
    });

    if (window.matchMedia("(min-width: 900px)").matches) {
      gsap.to(img, {
        y: -24,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    }
  }

  /* =========================================================
     8. CTA FINAL — segundo grande momento: costura fecha a composição
     ========================================================= */
  function initCtaFinal() {
    const section = document.querySelector(".cta-final");
    if (!section) return;
    const top = section.querySelector(".cta-stitch--top path");
    const bottom = section.querySelector(".cta-stitch--bottom path");
    const icon = section.querySelector(".cta-final-icon");
    const heading = section.querySelector("h2");
    const lede = section.querySelector(".cta-final-lede");
    const actions = section.querySelector(".cta-final-actions");

    [top, bottom].forEach((p) => {
      if (!p) return;
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: reduceMotion ? 0 : len });
    });

    if (reduceMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play reverse play reverse" },
      defaults: { ease: "power2.out" },
    });

    if (top) tl.to(top, { strokeDashoffset: 0, duration: 0.9 }, 0);
    if (icon) { gsap.set(icon, { opacity: 0, y: 14 }); tl.to(icon, { opacity: 1, y: 0, duration: 0.5 }, 0.25); }
    if (heading) { gsap.set(heading, { opacity: 0, y: 18 }); tl.to(heading, { opacity: 1, y: 0, duration: 0.6 }, 0.35); }
    if (lede) { gsap.set(lede, { opacity: 0, y: 14 }); tl.to(lede, { opacity: 1, y: 0, duration: 0.5 }, 0.5); }
    if (actions) { gsap.set(actions, { opacity: 0, y: 14 }); tl.to(actions, { opacity: 1, y: 0, duration: 0.5 }, 0.6); }
    if (bottom) tl.to(bottom, { strokeDashoffset: 0, duration: 0.9 }, 0.4);
  }

  /* =========================================================
     9. BOTÕES — efeito magnético muito leve (desktop)
     ========================================================= */
  function initMagneticButtons() {
    if (!isFinePointer) return;
    document.querySelectorAll(".btn").forEach((btn) => {
      const quickX = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
      const quickY = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        quickX(relX * 0.12);
        quickY(relY * 0.25);
      });
      btn.addEventListener("mouseleave", () => {
        quickX(0);
        quickY(0);
      });
    });
  }

  /* =========================================================
     10. CARDS DE BENEFÍCIOS — brilho seguindo o cursor (CSS var)
     ========================================================= */
  function initBenefitCards() {
    if (!isFinePointer) return;
    document.querySelectorAll(".diff-item").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });
  }

  /* =========================================================
     10b. CARDS DE IDENTIFICAÇÃO — leve tilt 3D seguindo o cursor (desktop)
     ========================================================= */
  function initIdentificationTilt() {
    if (!isFinePointer || reduceMotion) return;
    document.querySelectorAll(".identification-card").forEach((card) => {
      gsap.set(card, { transformPerspective: 700 });
      const quickRotY = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power3.out" });
      const quickRotX = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power3.out" });

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        quickRotY(relX * 9); // sutil — nada de exagero cartunesco
        quickRotX(relY * -7);
      });
      card.addEventListener("mouseleave", () => {
        quickRotY(0);
        quickRotX(0);
      });
    });
  }

  /* =========================================================
     10c. FAQ — altura animada via GSAP (mais precisa que max-height).
     main.js continua controlando QUANDO abre/fecha (clique, toggle de
     classe, aria-expanded); aqui só vive a animação em si — a mesma
     divisão de responsabilidades usada no portfólio e no mapa.
     ========================================================= */
  function initFaqAnimations() {
    document.querySelectorAll(".faq-answer").forEach((answer) => {
      gsap.set(answer, { height: 0 });
    });
  }

  function toggleFaq(item, isOpen) {
    const answer = item.querySelector(".faq-answer");
    if (!answer) return;

    if (reduceMotion) {
      gsap.set(answer, { height: isOpen ? "auto" : 0 });
      return;
    }

    gsap.killTweensOf(answer);
    if (isOpen) {
      gsap.set(answer, { height: "auto" });
      const target = answer.offsetHeight;
      gsap.fromTo(
        answer,
        { height: 0 },
        { height: target, duration: 0.45, ease: "power3.out", onComplete: () => gsap.set(answer, { height: "auto" }) }
      );
    } else {
      gsap.set(answer, { height: answer.offsetHeight }); // parte do valor real, nunca de "auto"
      gsap.to(answer, { height: 0, duration: 0.35, ease: "power2.inOut" });
    }
  }

  window.AtelieAnimations.toggleFaq = toggleFaq;

  /* =========================================================
     11. SCROLL THREAD — indicador de progresso na lateral (desktop)
     ========================================================= */
  function initScrollThread() {
    const fill = document.querySelector(".scroll-thread-fill");
    if (!fill || reduceMotion) return;
    gsap.to(fill, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
    });
  }

  /* =========================================================
     11b. NAV ATIVA — sublinhado "costurado" que desliza até o link da
     seção visível (desktop apenas). Um ScrollTrigger por seção (mesmo
     padrão do resto do arquivo), sem listener de scroll extra.
     ========================================================= */
  function initActiveNavIndicator() {
    const nav = document.getElementById("main-nav");
    const indicator = nav ? nav.querySelector(".nav-active-indicator") : null;
    if (!nav || !indicator) return;

    const links = [...nav.querySelectorAll('a[href^="#"]')]
      .map((link) => ({ link, section: document.getElementById(link.getAttribute("href").slice(1)) }))
      .filter((entry) => entry.section);
    if (!links.length) return;

    let activeLink = null;

    function moveIndicatorTo(link) {
      const isDesktop = window.matchMedia("(min-width: 900px)").matches;
      if (!isDesktop) {
        gsap.set(indicator, { opacity: 0 });
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      // x/y calculados a partir do próprio link (não de um `bottom` fixo no
      // container do nav) — assim o traço fica sempre colado ao link certo,
      // mesmo que o nav quebre em mais de uma linha em alguma largura.
      gsap.to(indicator, {
        x: linkRect.left - navRect.left,
        y: linkRect.bottom - navRect.top + 4,
        width: linkRect.width,
        opacity: 1,
        duration: reduceMotion ? 0 : 0.4,
        ease: "power3.out",
      });
    }

    function setActive(link) {
      if (activeLink === link) return;
      activeLink = link;
      links.forEach(({ link: l }) => l.classList.toggle("is-active", l === link));
      moveIndicatorTo(link);
    }

    links.forEach(({ link, section }) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 45%",
        end: "bottom 45%",
        onEnter: () => setActive(link),
        onEnterBack: () => setActive(link),
      });
    });

    window.addEventListener("resize", () => {
      if (activeLink) moveIndicatorTo(activeLink);
    });
  }

  /* =========================================================
     12. TÍTULOS — SplitType por linha em h2 de seções estratégicas
     ========================================================= */
  function initHeadings() {
    if (reduceMotion || !window.SplitType) return;
    document.querySelectorAll("h2.section-title").forEach((heading) => {
      if (heading.closest(".hero")) return; // hero já tratado em initHero()
      let split;
      try {
        split = new SplitType(heading, { types: "lines", lineClass: "split-line" });
      } catch (err) {
        return;
      }
      if (!split.lines || !split.lines.length) return;
      split.lines.forEach((line) => {
        const wrap = document.createElement("span");
        wrap.className = "split-line-wrap";
        line.parentNode.insertBefore(wrap, line);
        wrap.appendChild(line);
      });
      gsap.set(split.lines, { yPercent: 110, opacity: 0 });
      ScrollTrigger.create({
        trigger: heading,
        start: "top 88%",
        once: true,
        onEnter: () => gsap.to(split.lines, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }),
      });
    });
  }

  /* =========================================================
     13. CURSOR CUSTOMIZADO — minimalista, só desktop com ponteiro fino
     ========================================================= */
  function initCustomCursor() {
    if (!isFinePointer || reduceMotion) return;

    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);
    document.body.classList.add("has-custom-cursor");

    const quickX = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3.out" });
    const quickY = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3.out" });

    document.addEventListener("mousemove", (e) => {
      cursor.classList.add("is-active");
      quickX(e.clientX);
      quickY(e.clientY);
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));

    document.querySelectorAll(".portfolio-item").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-view"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-view"));
    });
    document.querySelectorAll(".btn, .icon-link, a").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-button"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-button"));
    });
  }

  /* =========================================================
     14. MAPA — "do mundo até a loja": viagem cinematográfica sobre a
     MESMA instância do Leaflet criada em main.js (nunca um segundo mapa).
     Só é acionada quando a seção realmente entra na tela — não no load —
     e só roda uma vez: depois disso o mapa fica normalmente utilizável
     (zoom, arraste, popup, botão do Google Maps).
     ========================================================= */
  function initMapJourney() {
    const section = document.getElementById("localizacao");
    const mapReady = window.AtelieMapReady;
    if (!section || !mapReady || typeof mapReady.then !== "function") return;

    mapReady.then((data) => {
      if (!data || !data.map || !data.cinematic) return; // sem GSAP ou reduced-motion: main.js já entregou a vista final
      const { map, marker, target } = data;
      const wrap = section.querySelector(".location-map");
      if (!wrap) return;

      const label = document.createElement("div");
      label.className = "map-journey-label";
      label.setAttribute("aria-hidden", "true");
      wrap.appendChild(label);

      function showLabel(text, holdDuration) {
        gsap.killTweensOf(label);
        label.textContent = text;
        gsap.fromTo(label, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(label, { opacity: 0, y: -8, duration: 0.4, ease: "power2.in", delay: Math.max(0.25, holdDuration - 0.5) });
      }

      function revealMarker() {
        marker.setOpacity(1);
        const el = marker.getElement();
        if (el) {
          const inner = el.querySelector(".map-pin-inner");
          if (inner) gsap.fromTo(inner, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2.3)" });
          el.classList.add("map-pin-pulse");
          window.setTimeout(() => el.classList.remove("map-pin-pulse"), 2200);
        }
        window.setTimeout(() => marker.openPopup(), 250);
      }

      const isMobile = window.matchMedia("(max-width: 699px)").matches;

      function runJourney() {
        gsap.to(wrap, { scale: 1, duration: 1, ease: "power3.out" });

        if (isMobile) {
          showLabel("Brasil", 1.1);
          map.flyTo([target.lat, target.lon], 5, { duration: 1.1 });
          map.once("moveend", () => {
            showLabel("Governador Valadares", 1.2);
            map.flyTo([target.lat, target.lon], 16, { duration: 1.3 });
            map.once("moveend", () => {
              showLabel("Ateliê do Bordado", 1);
              revealMarker();
            });
          });
        } else {
          showLabel("Brasil", 1.4);
          map.flyTo([target.lat, target.lon], 5, { duration: 1.4 });
          map.once("moveend", () => {
            showLabel("Minas Gerais", 1.3);
            map.flyTo([target.lat, target.lon], 9, { duration: 1.3 });
            map.once("moveend", () => {
              showLabel("Governador Valadares", 1.4);
              map.flyTo([target.lat, target.lon], 17, { duration: 1.6 });
              map.once("moveend", () => {
                showLabel("Ateliê do Bordado", 1);
                revealMarker();
              });
            });
          });
        }
      }

      gsap.set(wrap, { scale: 0.94 });

      ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        once: true,
        onEnter: runJourney,
      });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initHero();
    initSectionReveal();
    initSewing();
    initMapJourney();
    initPersonalizacao();
    initStepsThread();
    initAbout();
    initCtaFinal();
    initMagneticButtons();
    initBenefitCards();
    initIdentificationTilt();
    initFaqAnimations();
    initScrollThread();
    initActiveNavIndicator();
    initHeadings();
    initCustomCursor();

    // Recalcula medidas dependentes de layout (tesoura/costura/linha de etapas)
    // depois que fontes/imagens terminarem de carregar, para não ficar com
    // valores medidos "cedo demais".
    window.addEventListener("load", () => ScrollTrigger.refresh());
  });
})();
