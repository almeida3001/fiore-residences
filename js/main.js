/* ============================================================
   VOOGA FITNESS — motion engine
   GSAP + ScrollTrigger + Lenis. Progressive enhancement.
   ============================================================ */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!window.gsap;
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- helpers ---------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* split a heading into word-spans wrapped in masks (whole-line overflow hidden) */
  function splitWords(el) {
    const html = el.innerHTML;
    // keep <br> as line breaks
    const parts = html.split(/(<br\s*\/?>)/i);
    el.innerHTML = '';
    const spans = [];
    parts.forEach((p) => {
      if (/<br/i.test(p)) { el.appendChild(document.createElement('br')); return; }
      p.split(/(\s+)/).forEach((tok) => {
        if (tok.trim() === '') { el.appendChild(document.createTextNode(tok)); return; }
        const w = document.createElement('span');
        w.className = 'word';
        const inner = document.createElement('span');
        inner.innerHTML = tok;
        w.appendChild(inner);
        el.appendChild(w);
        spans.push(inner);
      });
    });
    return spans;
  }

  /* ============================================================
     PRELOADER
     ============================================================ */
  function preloader(done) {
    const pre = $('#preloader');
    const bar = $('.pre-bar i');
    const count = $('.pre-count');
    let booted = false;
    const finish = (instant) => {
      if (booted) return;
      booted = true;
      if (!pre) { done(); return; }
      if (instant || reduce || !hasGsap) { pre.style.display = 'none'; done(); return; }
      const tl = gsap.timeline({ onComplete: done });
      tl.to('.pre-inner', { y: -30, opacity: 0, duration: .55, ease: 'power2.in' })
        .to(pre, { yPercent: -100, duration: .85, ease: 'expo.inOut' }, '-=.1')
        .set(pre, { display: 'none' });
    };
    // hard safety: never let the site hang behind the preloader (e.g. background tab throttling)
    const safety = setTimeout(() => finish(true), 4500);
    if (!pre || reduce || !hasGsap) { clearTimeout(safety); finish(true); return; }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: 100, duration: 1.3, ease: 'power2.inOut',
      onUpdate() {
        const n = Math.round(obj.v);
        bar.style.width = n + '%';
        count.textContent = n + '%';
      },
      onComplete() { clearTimeout(safety); finish(false); }
    });
  }

  /* ============================================================
     LENIS SMOOTH SCROLL
     ============================================================ */
  let lenis = null;
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // anchor links
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const t = $(id);
        if (!t) return;
        e.preventDefault();
        closeMenu();
        lenis.scrollTo(t, { offset: -10, duration: 1.3 });
      });
    });
  }

  /* ============================================================
     NAV
     ============================================================ */
  function initNav() {
    const nav = $('#nav');
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      if (y > last && y > 400) nav.classList.add('hide');
      else nav.classList.remove('hide');
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile menu ---------- */
  const menu = $('#mobile-menu');
  const burger = $('#burger');
  function openMenu() {
    if (!hasGsap) { menu.classList.add('open'); menu.style.clipPath = 'inset(0 0 0 0)'; return; }
    burger.classList.add('on');
    menu.classList.add('open');
    gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .7, ease: 'expo.inOut' });
    gsap.fromTo('#mobile-menu a', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .6, ease: 'power3.out', delay: .15 });
    if (lenis) lenis.stop();
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('open')) return;
    burger.classList.remove('on');
    if (!hasGsap) { menu.classList.remove('open'); menu.style.clipPath = 'inset(0 0 100% 0)'; return; }
    gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .55, ease: 'expo.inOut', onComplete: () => menu.classList.remove('open') });
    if (lenis) lenis.start();
  }
  if (burger) burger.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());

  /* ============================================================
     ANIMATIONS (run after preloader)
     ============================================================ */
  function initAnimations() {
    if (!hasGsap) { $$('[data-rise]').forEach((e) => (e.style.opacity = 1)); return; }

    /* hero entrance */
    $$('.hero [data-rise]').forEach((e) => { e.style.opacity = '1'; e.style.transform = 'none'; });
    const heroInner = $$('.hero-title .line-inner');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.nav', { y: -40, opacity: 0, duration: .9 }, 0)
      .from('.hero-eyebrow', { y: 20, opacity: 0, duration: .8 }, .15)
      .from(heroInner, { yPercent: 115, duration: 1.15, stagger: .1 }, .25)
      .from('.hero-card', { y: 34, opacity: 0, duration: .9 }, '-=.6')
      .from('.hero-aside', { y: 34, opacity: 0, duration: .9 }, '-=.75');

    /* hero parallax bg */
    const heroBg = $('[data-hero-bg]');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 18, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    /* generic rise */
    $$('[data-rise]').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* split headings */
    $$('[data-split]').forEach((el) => {
      const words = splitWords(el);
      gsap.from(words, {
        yPercent: 110, duration: 1, ease: 'expo.out', stagger: .035,
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    /* marquee infinite */
    const track = $('.marquee-track');
    if (track) {
      const w = track.scrollWidth / 2;
      gsap.to(track, { x: -w, duration: 22, ease: 'none', repeat: -1 });
      // velocity skew on scroll
      let curX = 0;
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-60, 60, self.getVelocity() / -60);
          gsap.to(track, { x: '+=' + v, duration: .4, overwrite: false });
        }
      });
    }

    /* manifesto word-by-word color fill */
    const man = $('[data-manifesto]');
    if (man) {
      const words = man.textContent.split(' ');
      man.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
      gsap.to('[data-manifesto] .w', {
        color: '#F5F4F1', stagger: .5, ease: 'none',
        scrollTrigger: { trigger: man, start: 'top 75%', end: 'bottom 60%', scrub: true }
      });
    }

    /* differential cards stagger + img parallax */
    gsap.from('[data-card]', {
      y: 60, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08,
      scrollTrigger: { trigger: '.diff-grid', start: 'top 80%' }
    });
    $$('[data-card] .ph img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.closest('[data-card]'), start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* pinned horizontal gallery */
    const gal = $('[data-gal]');
    const galTrack = $('[data-gal-track]');
    const prog = $('[data-gal-prog]');
    if (gal && galTrack) {
      const getScroll = () => galTrack.scrollWidth - window.innerWidth + (window.innerWidth * 0.06);
      gsap.to(galTrack, {
        x: () => -getScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger: gal,
          start: 'top top',
          end: () => '+=' + getScroll() * 1.1,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => { if (prog) prog.style.width = (8 + self.progress * 92) + '%'; }
        }
      });
    }

    /* counters */
    $$('[data-count]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const span = $('span', el);
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(obj, {
          v: target, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { span.textContent = Math.round(obj.v); }
        })
      });
    });

    /* final bg parallax */
    const finalBg = $('.final-bg');
    if (finalBg) gsap.to(finalBg, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });

    ScrollTrigger.refresh();
  }

  /* ============================================================
     VIDEO CARDS (Reels) — lazy play in view, pause out of view
     ============================================================ */
  function initVideos() {
    $$('[data-video]').forEach((card) => {
      const v = $('video', card);
      const sound = $('.vc-sound', card);
      const play = $('.vc-play', card);
      const badge = $('.vc-badge', card);
      if (!v) return;
      if (badge) badge.textContent = card.getAttribute('data-badge') || '';
      let userPaused = false;
      const tryPlay = () => { if (userPaused) return; const p = v.play(); if (p && p.catch) p.catch(() => {}); };

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && e.intersectionRatio >= .5) { if (!reduce) tryPlay(); }
            else if (!v.paused) { v.pause(); }
          });
        }, { threshold: [0, .5, 1] });
        io.observe(card);
      }

      v.addEventListener('play', () => card.classList.add('playing'));
      v.addEventListener('pause', () => card.classList.remove('playing'));

      play.addEventListener('click', (e) => { e.stopPropagation(); userPaused = false; tryPlay(); });
      v.addEventListener('click', () => {
        if (v.paused) { userPaused = false; tryPlay(); }
        else { userPaused = true; v.pause(); }
      });
      sound.addEventListener('click', (e) => {
        e.stopPropagation();
        v.muted = !v.muted;
        sound.setAttribute('data-muted', v.muted ? 'true' : 'false');
        if (!v.muted) { userPaused = false; tryPlay(); }
      });
    });
  }

  /* ============================================================
     CUSTOM CURSOR + MAGNETIC
     ============================================================ */
  function initCursor() {
    if (!hasGsap || window.matchMedia('(hover:none)').matches || window.innerWidth < 980) return;
    const dot = $('.cursor'), ring = $('.cursor-ring');
    if (!dot) return;
    const xT = gsap.quickTo(dot, 'x', { duration: .15, ease: 'power3' });
    const yT = gsap.quickTo(dot, 'y', { duration: .15, ease: 'power3' });
    const xR = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' });
    const yR = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { xT(e.clientX); yT(e.clientY); xR(e.clientX); yR(e.clientY); });
    $$('[data-cursor], a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('grow'));
      el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
    });
    /* magnetic */
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .35, y: (e.clientY - r.top - r.height / 2) * .45, duration: .5, ease: 'power3' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* ============================================================
     SCROLL MAGIC
     ============================================================ */
  function initScrollMagic() {
    if (!hasGsap || !window.ScrollTrigger) return;

    /* 1. Clip-path reveal — [data-clip-reveal]
       Mais cinematográfico: a imagem/bloco se abre de baixo pra cima como uma cortina.
       Atributo opcional: data-clip-reveal="left" (abre da esquerda) */
    $$('[data-clip-reveal]').forEach((el) => {
      const dir = el.getAttribute('data-clip-reveal');
      const from = dir === 'left'  ? 'inset(0 100% 0 0)' :
                   dir === 'right' ? 'inset(0 0 0 100%)' :
                   dir === 'top'   ? 'inset(0 0 100% 0)' :
                                     'inset(100% 0 0 0)';  // default: baixo→cima
      gsap.fromTo(el,
        { clipPath: from },
        {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
      );
    });

    /* 2. Parallax genérico — [data-parallax="0.15"]
       Speed fraction: 0.1 = sutil, 0.3 = dramático.
       Aplica em qualquer elemento dentro de uma seção. */
    $$('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      gsap.fromTo(el,
        { yPercent: -(speed * 100) },
        {
          yPercent: speed * 100, ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: 'top bottom', end: 'bottom top', scrub: true
          }
        }
      );
    });

    /* 3. Line-by-line reveal — [data-lines]
       Divide o innerHTML por <br> e revela cada linha com máscara.
       Diferente do [data-split] (por palavras): aqui é linha completa, mais editorial.
       Cada <br> no HTML vira uma linha independente com overflow:hidden. */
    $$('[data-lines]').forEach((el) => {
      const raw = el.innerHTML;
      const parts = raw.split(/<br\s*\/?>/i).map((t) => t.trim()).filter(Boolean);
      if (parts.length < 2) return;
      el.innerHTML = parts
        .map((l) => `<span class="sm-line"><span class="sm-inner">${l}</span></span>`)
        .join('');
      gsap.from($$('.sm-inner', el), {
        yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.13,
        scrollTrigger: { trigger: el, start: 'top 84%' }
      });
    });

    /* 4. Scale reveal — [data-scale-in]
       Elemento entra em escala 0.88 + opacity 0, cresce para natural.
       Ótimo para cards, imagens quadradas, blocos de conteúdo. */
    $$('[data-scale-in]').forEach((el) => {
      gsap.fromTo(el,
        { scale: 0.88, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%' }
        }
      );
    });

    /* 5. Scrub fill — [data-scrub-fill]
       Texto vai de --muted para --ink à medida que você rola por ele.
       Semelhante ao manifesto, mas reutilizável em qualquer bloco. */
    $$('[data-scrub-fill]').forEach((el) => {
      if (el.hasAttribute('data-manifesto')) return; // evita conflito
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map((w) => `<span class="sf-w">${w}</span>`).join(' ');
      gsap.fromTo($$('.sf-w', el),
        { color: 'var(--muted)' },
        {
          color: 'var(--ink)', stagger: 0.5, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 72%', end: 'bottom 38%', scrub: true }
        }
      );
    });

    /* 6. Slide-in lateral — [data-slide-in="left|right"]
       Bloco vem da esquerda ou direita com fade. Ideal para colunas de 2 lados. */
    $$('[data-slide-in]').forEach((el) => {
      const xAmt = el.getAttribute('data-slide-in') === 'right' ? 80 : -80;
      gsap.fromTo(el,
        { x: xAmt, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.15, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 87%' }
        }
      );
    });

    /* 7. Rotate reveal — [data-rotate-in]
       Elemento entra ligeiramente rotacionado + fade. Toque editorial premium. */
    $$('[data-rotate-in]').forEach((el) => {
      const deg = parseFloat(el.getAttribute('data-rotate-in')) || 4;
      gsap.fromTo(el,
        { rotation: deg, opacity: 0, transformOrigin: 'left center' },
        {
          rotation: 0, opacity: 1, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
      );
    });

    /* 8. Sticky text section — [data-sticky-section]
       Pino uma seção enquanto o conteúdo interno scruba (título enorme que fica).
       Wrapper precisa de: data-sticky-section. Filho com data-sticky-pin fica pinado.
       Filho com data-sticky-content scruba e revela. */
    $$('[data-sticky-section]').forEach((section) => {
      const pin = $('[data-sticky-pin]', section);
      const items = $$('[data-sticky-item]', section);
      if (!pin || !items.length) return;

      const scrollDist = items.length * window.innerHeight * 0.85;
      section.style.height = `calc(100vh + ${scrollDist}px)`;

      gsap.to(pin, {
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => `+=${scrollDist}`,
          pin: pin, pinSpacing: false, scrub: true
        }
      });

      items.forEach((item, i) => {
        gsap.fromTo(item,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: () => `top+=${i * window.innerHeight * 0.8} top`,
              end: () => `top+=${(i + 1) * window.innerHeight * 0.8} top`,
              scrub: 0.5,
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      });
    });

    ScrollTrigger.refresh();
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    initNav();
    initLenis();
    initCursor();
    initVideos();
    initAnimations();
    initScrollMagic();
  }
  // wait for fonts to avoid split jumps
  const start = () => preloader(boot);
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(start);
  } else { start(); }

  window.addEventListener('load', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
