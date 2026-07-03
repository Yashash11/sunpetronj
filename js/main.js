/* =========================================================
   Snack & Go at Sun Petro — interactions
   ========================================================= */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---- Current year in footer ---- */
  const yr = $("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Sticky header shadow ---- */
  const header = $(".site-header");
  const onScrollHeader = () => header.classList.toggle("scrolled", window.scrollY > 12);
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---- Mobile nav toggle ---- */
  const nav = $(".nav");
  const toggle = $(".nav-toggle");
  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove("open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  };
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // close menu after clicking a link
    $$(".nav-menu a").forEach((a) => a.addEventListener("click", closeMenu));
    // close menu on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---- Brand / logo: go home, or smooth-scroll to top when already on the homepage ---- */
  const brand = $(".brand");
  if (brand) {
    const onHomepage = () => {
      const p = location.pathname;
      return p === "/" || p === "" || p.endsWith("/index.html") || p.endsWith("/");
    };
    const toTopSmooth = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      // move keyboard focus to the very top for a11y
      document.querySelector(".skip-link")?.focus?.({ preventScroll: true });
    };
    brand.addEventListener("click", (e) => {
      // Already on the homepage → smooth-scroll up instead of reloading.
      // On any other page, let the href navigate to the homepage normally.
      if (onHomepage()) {
        e.preventDefault();
        closeMenu();
        toTopSmooth();
        history.replaceState(null, "", location.pathname + location.search);
      }
    });
    // Anchors activate on Enter natively; make Space work too.
    brand.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        brand.click();
      }
    });
  }

  /* ---- Hero carousel ---- */
  const carousel = $("[data-carousel]");
  if (carousel) {
    const slides = $$(".hero-slide", carousel);
    const dotsWrap = $("[data-dots]", carousel);
    let index = slides.findIndex((s) => s.classList.contains("is-active"));
    if (index < 0) index = 0;
    let timer;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // build dots
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      if (i === index) b.classList.add("active");
      b.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = $$("button", dotsWrap);

    function go(n, user) {
      slides[index].classList.remove("is-active");
      dots[index].classList.remove("active");
      index = (n + slides.length) % slides.length;
      slides[index].classList.add("is-active");
      dots[index].classList.add("active");
      if (user) restart();
    }
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    function start() { if (!reduce) timer = setInterval(next, 5500); }
    function restart() { clearInterval(timer); start(); }

    $("[data-next]", carousel)?.addEventListener("click", () => go(index + 1, true));
    $("[data-prev]", carousel)?.addEventListener("click", () => go(index - 1, true));

    // pause on hover
    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", start);
    // keyboard
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") go(index + 1, true);
      if (e.key === "ArrowLeft") go(index - 1, true);
    });
    start();
  }

  /* ---- Scroll reveal ---- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ---- Back to top ---- */
  const toTop = $("[data-to-top]");
  if (toTop) {
    toTop.hidden = false;
    const onScrollTop = () => toTop.classList.toggle("show", window.scrollY > 600);
    onScrollTop();
    window.addEventListener("scroll", onScrollTop, { passive: true });
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ---- Image fallback: swap a failed stock photo for an on-brand tile ---- */
  function fallback(img) {
    if (img.dataset.failed) return;      // guard against loops
    img.dataset.failed = "1";
    const div = document.createElement("div");
    div.className = "img-fallback";
    const label = document.createElement("span");
    label.textContent = img.getAttribute("alt") || "Snack & Go";
    div.appendChild(label);
    img.replaceWith(div);
  }
  $$("img.stock").forEach((img) => {
    img.addEventListener("error", () => fallback(img));
    // handle images that errored before JS ran
    if (img.complete && img.naturalWidth === 0) fallback(img);
  });
})();
