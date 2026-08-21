(function () {
  "use strict";

  /* ---------- Analytics stub ---------- */
  function trackEvent(eventName, params) {
    // Ponto único para futura integração com Google Analytics / Meta Pixel.
    if (window.gtag) window.gtag("event", eventName, params || {});
    if (window.fbq) window.fbq("trackCustom", eventName, params || {});
    console.debug("[event]", eventName, params || {});
  }
  window.trackEvent = trackEvent;

  /* ---------- WhatsApp helper ---------- */
  function whatsappUrl(message) {
    const number = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  function bindWhatsappLinks() {
    document.querySelectorAll("[data-wa]").forEach((el) => {
      const key = el.getAttribute("data-wa");
      const message = SITE_CONFIG.messages[key] || SITE_CONFIG.messages.hero;
      el.setAttribute("href", whatsappUrl(message));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
      el.addEventListener("click", () => trackEvent(`click_whatsapp_${key}`));
    });
  }

  function bindInstagramLinks() {
    document.querySelectorAll("[data-ig]").forEach((el) => {
      const key = el.getAttribute("data-ig");
      el.setAttribute("href", SITE_CONFIG.instagramUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
      el.addEventListener("click", () => trackEvent(`click_instagram_${key}`));
    });
  }

  function fillBusinessInfo() {
    document.querySelectorAll("[data-business-name]").forEach((el) => (el.textContent = SITE_CONFIG.businessName));
    document.querySelectorAll("[data-business-address]").forEach((el) => (el.textContent = SITE_CONFIG.businessAddress));
    document.querySelectorAll("[data-business-hours]").forEach((el) => (el.textContent = SITE_CONFIG.businessHours));

    const query = encodeURIComponent(`${SITE_CONFIG.businessName}, ${SITE_CONFIG.businessAddress}`);

    const mapsLink = document.getElementById("location-maps-link");
    if (mapsLink) {
      mapsLink.setAttribute("href", `https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  }

  /* ---------- Location map (Leaflet + OpenStreetMap, sem chave de API) ---------- */
  async function initLocationMap() {
    const canvas = document.getElementById("location-map-canvas");
    if (!canvas || typeof L === "undefined") return;

    const address = SITE_CONFIG.businessAddress;
    const geocodeQuery = encodeURIComponent(address);
    const mapsQuery = encodeURIComponent(`${SITE_CONFIG.businessName}, ${address}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

    let lat = -18.8511;
    let lon = -41.9494; // Governador Valadares/MG — usado como centro de fallback caso a geocodificação falhe
    let found = false;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${geocodeQuery}`);
      const results = await res.json();
      if (results && results[0]) {
        lat = parseFloat(results[0].lat);
        lon = parseFloat(results[0].lon);
        found = true;
      }
    } catch (err) {
      console.warn("Não foi possível geocodificar o endereço, exibindo mapa aproximado.", err);
    }

    const map = L.map(canvas, {
      center: [lat, lon],
      zoom: found ? 16 : 13,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: "map-pin",
      html: `<svg viewBox="0 0 24 30" width="34" height="42"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18c0-6.6-5.4-12-12-12Z" fill="var(--color-accent)"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>`,
      iconSize: [34, 42],
      iconAnchor: [17, 42],
      popupAnchor: [0, -38],
    });

    const marker = L.marker([lat, lon], { icon: pinIcon }).addTo(map);
    marker.bindPopup(
      `<strong>${SITE_CONFIG.businessName}</strong><br>${address}<br><a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">Ver no Google Maps →</a>`
    );
    marker.openPopup();
  }

  /* ---------- Portfolio rendering ---------- */
  function renderPortfolio() {
    const grid = document.getElementById("portfolio-grid");
    const filtersEl = document.getElementById("portfolio-filters");
    if (!grid || !filtersEl) return;

    SITE_CONFIG.categories.forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.className = "filter-btn" + (i === 0 ? " is-active" : "");
      btn.type = "button";
      btn.textContent = cat.label;
      btn.setAttribute("data-filter", cat.id);
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      filtersEl.appendChild(btn);
    });

    SITE_CONFIG.portfolioItems.forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = "portfolio-item";
      figure.setAttribute("data-category", item.category);

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt;
      img.loading = "lazy";
      img.width = 480;
      img.height = 480;
      img.addEventListener("click", () => openLightbox(index));
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Ampliar imagem: ${item.alt}`);
      img.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });

      figure.appendChild(img);
      grid.appendChild(figure);
    });

    trackEvent("view_portfolio");

    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      const filter = btn.getAttribute("data-filter");

      filtersEl.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });

      grid.querySelectorAll(".portfolio-item").forEach((item) => {
        const show = filter === "todos" || item.getAttribute("data-category") === filter;
        item.style.display = show ? "" : "none";
      });

      trackEvent("select_portfolio_category", { category: filter });
    });
  }

  /* ---------- Lightbox ---------- */
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const modal = document.getElementById("lightbox");
    const imgEl = document.getElementById("lightbox-img");
    const item = SITE_CONFIG.portfolioItems[index];
    imgEl.src = item.image;
    imgEl.alt = item.alt;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");

    const waLink = document.getElementById("lightbox-wa");
    waLink.setAttribute("href", whatsappUrl(SITE_CONFIG.messages.portfolio));

    trackEvent("open_portfolio_image", { category: item.category });
    document.getElementById("lightbox-close").focus();
  }

  function closeLightbox() {
    const modal = document.getElementById("lightbox");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  function bindLightbox() {
    const modal = document.getElementById("lightbox");
    if (!modal) return;
    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") openLightbox((currentIndex + 1) % SITE_CONFIG.portfolioItems.length);
      if (e.key === "ArrowLeft") openLightbox((currentIndex - 1 + SITE_CONFIG.portfolioItems.length) % SITE_CONFIG.portfolioItems.length);
    });
  }

  /* ---------- Logo viewer ---------- */
  function bindLogoViewer() {
    const trigger = document.getElementById("logo-viewer-trigger");
    const modal = document.getElementById("logo-viewer");
    if (!trigger || !modal) return;
    const close = document.getElementById("logo-viewer-close");

    function open(e) {
      e.preventDefault();
      e.stopPropagation();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      close.focus();
    }
    function hide() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    }

    trigger.addEventListener("click", open);
    close.addEventListener("click", hide);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hide();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) hide();
    });
  }

  /* ---------- FAQ accordion ---------- */
  function bindFaq() {
    document.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question");
      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        document.querySelectorAll(".faq-item.is-open").forEach((el) => {
          el.classList.remove("is-open");
          el.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function bindMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Header scroll state + back to top ---------- */
  function bindScrollUi() {
    const header = document.getElementById("site-header");
    const backToTop = document.getElementById("back-to-top");
    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY > 40;
      header.classList.toggle("is-scrolled", scrolled);
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Scroll reveal ---------- */
  function bindScrollReveal() {
    const targets = document.querySelectorAll("[data-reveal], [data-reveal-group]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    fillBusinessInfo();
    initLocationMap();
    renderPortfolio();
    bindWhatsappLinks();
    bindInstagramLinks();
    bindLightbox();
    bindLogoViewer();
    bindFaq();
    bindMobileMenu();
    bindScrollUi();
    bindScrollReveal();
    document.getElementById("year").textContent = new Date().getFullYear();
  });
})();
