/**
 * All scroll + entrance motion for the page (PRD › Scroll animations and interactions).
 *
 * Rules:
 * - prefers-reduced-motion: reduce → nothing runs: no Lenis, no parallax, no count-up, all content visible.
 * - Hidden starting states are applied from JS only (gsap.from / gsap.set), so content stays visible if JS fails.
 * - Only transform + opacity are animated (plus clip-path for the h2 reveal).
 * - Parallax + cursor effects only on desktop (≥1024px with a fine pointer).
 * - Every entrance plays once, 0.4–0.9s, power3.out.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  root.classList.remove('js-anim');
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });
  init();
}

function init() {
  const isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
  const START = 'top 85%';
  const once = (trigger: Element | string, start = START): ScrollTrigger.Vars => ({ trigger, start, once: true });

  /* ---------- Lenis smooth scroll, synced with ScrollTrigger ---------- */
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Pause Lenis while the lightbox (or mobile menu) locks the page
  new MutationObserver(() => {
    if (root.classList.contains('lenis-stopped')) lenis.stop();
    else lenis.start();
  }).observe(root, { attributes: true, attributeFilter: ['class'] });

  // Anchor links scroll smoothly with a 72px navbar offset
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      if (id === '#') return;
      const target = id === '#top' ? 0 : document.querySelector<HTMLElement>(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72, duration: 1.2 });
      history.replaceState(null, '', id);
      // move focus for keyboard + screen reader users
      const el = id === '#top' ? document.getElementById('top') : (target as HTMLElement);
      if (el) {
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- Hero ---------- */
  const heroTitle = document.querySelector<HTMLElement>('.hero-title');
  const heroFades = gsap.utils.toArray<HTMLElement>('.hero-fade');
  const heroPhoto = document.querySelector<HTMLElement>('[data-hero-photo]');

  document.fonts.ready.then(() => {
    const tl = gsap.timeline({ onStart: () => root.classList.remove('js-anim') });
    if (heroTitle) {
      const split = SplitText.create(heroTitle, { type: 'lines', linesClass: 'hero-line' });
      tl.from(split.lines, { y: 40, opacity: 0, stagger: 0.08, duration: 0.9 }, 0);
    }
    tl.from(heroFades, { y: 20, opacity: 0, stagger: 0.1, duration: 0.7 }, 0.35);
    if (heroPhoto) tl.from(heroPhoto, { scale: 0.95, opacity: 0, duration: 0.9 }, 0.15);
  });

  if (heroPhoto && isDesktop) {
    gsap.to(heroPhoto, {
      y: 40,
      ease: 'none',
      scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // Blue glow drifts toward the cursor (max 60px)
  const glow = document.querySelector<HTMLElement>('.hero-glow');
  const hero = document.getElementById('top');
  if (glow && hero && isDesktop) {
    const xTo = gsap.quickTo(glow, 'x', { duration: 1.2, ease: 'power3.out' });
    const yTo = gsap.quickTo(glow, 'y', { duration: 1.2, ease: 'power3.out' });
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 120);
      yTo(((e.clientY - r.top) / r.height - 0.5) * 120);
    });
    hero.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  }

  /* ---------- Stat cards: count up from 0 ---------- */
  const counters = gsap.utils.toArray<HTMLElement>('[data-count]');
  counters.forEach((el) => {
    const end = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals ?? 0);
    const obj = { v: 0 };
    el.textContent = (0).toFixed(decimals);
    gsap.to(obj, {
      v: end,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: once(el, 'top 95%'),
      onUpdate: () => (el.textContent = obj.v.toFixed(decimals)),
      onComplete: () => (el.textContent = end.toFixed(decimals)),
    });
  });
  gsap.from('.stat-item', { y: 24, opacity: 0, stagger: 0.08, duration: 0.7, scrollTrigger: once('.stats', 'top 95%') });

  /* ---------- Section labels: typed out with a blinking cursor ---------- */
  gsap.utils.toArray<HTMLElement>('[data-typed]').forEach((el) => {
    const text = (el.textContent ?? '').trim();
    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text; // screen readers get the full label immediately
    const out = document.createElement('span');
    out.setAttribute('aria-hidden', 'true');
    const cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.append(sr, out, cursor);

    const state = { n: 0 };
    gsap
      .timeline({ scrollTrigger: once(el, 'top 90%') })
      .to(state, {
        n: text.length,
        duration: Math.min(0.9, text.length * 0.045),
        ease: 'none',
        onUpdate: () => (out.textContent = text.slice(0, Math.round(state.n))),
      })
      .to(cursor, { opacity: 0, duration: 0.2, delay: 1.1, onComplete: () => cursor.remove() });
  });

  /* ---------- Section h2: clip-reveal from bottom ---------- */
  gsap.utils.toArray<HTMLElement>('.reveal-h2').forEach((h) => {
    gsap.from(h, {
      clipPath: 'inset(100% 0% 0% 0%)',
      y: 24,
      duration: 0.9,
      scrollTrigger: once(h, 'top 90%'),
      clearProps: 'clipPath',
    });
  });

  /* ---------- Jira board (Vue island, hydrated client:visible) ---------- */
  const animateBoard = () => {
    const card = document.querySelector<HTMLElement>('.tl-card');
    // Only touch the board after Vue has hydrated it (otherwise hydration mismatches)
    if (!card || !(window as unknown as { __timelineMounted?: boolean }).__timelineMounted || card.dataset.animated) return;
    card.dataset.animated = '1';
    const rows = card.querySelectorAll('.tl-row');
    const bars = card.querySelectorAll('.tl-bar');
    const strips = card.querySelectorAll('.tl-progress');
    const today = card.querySelector('.tl-today');
    const tag = card.querySelector('.tl-today-tag');

    gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(strips, { scaleX: 0, transformOrigin: 'left center' });
    if (today) gsap.set(today, { scaleY: 0, transformOrigin: 'top center' });

    const tl = gsap.timeline({ scrollTrigger: once(card, 'top 80%') });
    tl.from(card, { y: 30, opacity: 0, duration: 0.7 })
      .from(rows, { opacity: 0, y: 8, stagger: 0.05, duration: 0.4 }, 0.2)
      .to(bars, { scaleX: 1, stagger: 0.05, duration: 0.7, clearProps: 'transform' }, 0.35)
      .to(strips, { scaleX: 1, stagger: 0.05, duration: 0.5, clearProps: 'transform' }, '>-0.3')
      .to(today, { scaleY: 1, duration: 0.6, ease: 'power2.inOut' }, '>-0.1')
      .from(tag, { opacity: 0, y: -6, duration: 0.3 }, '<');
  };
  window.addEventListener('timeline:mounted', animateBoard);
  animateBoard(); // in case the island hydrated before this script ran

  /* ---------- Case studies ---------- */
  gsap.utils.toArray<HTMLElement>('.case-row').forEach((row) => {
    const fromX = row.dataset.side === 'right' ? 60 : -60;
    const gallery = row.querySelector('.case-gallery');
    const texts = row.querySelectorAll('.case-fade');
    const tl = gsap.timeline({ scrollTrigger: once(row, 'top 80%') });
    if (gallery) tl.from(gallery, { x: fromX, opacity: 0, duration: 0.9 }, 0);
    tl.from(texts, { y: 20, opacity: 0, stagger: 0.08, duration: 0.6 }, 0.15);
  });

  if (isDesktop) {
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((img) => {
      const frame = img.closest('.img-slot');
      gsap.fromTo(
        img,
        { yPercent: -4 },
        { yPercent: 4, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
  }

  /* ---------- About ---------- */
  gsap.from('.about-card', { y: 30, opacity: 0, stagger: 0.1, duration: 0.7, scrollTrigger: once('#about .grid', 'top 85%') });
  gsap.from('.exp-item', { y: 16, opacity: 0, stagger: 0.07, duration: 0.5, delay: 0.2, scrollTrigger: once('#about .grid', 'top 85%') });
  gsap.from('.skill-chip', {
    scale: 0.9,
    opacity: 0,
    stagger: 0.025,
    duration: 0.4,
    delay: 0.3,
    ease: 'back.out(1.7)',
    scrollTrigger: once('#about .grid', 'top 85%'),
  });

  /* ---------- Contact ---------- */
  const contactTitle = document.querySelector<HTMLElement>('.contact-title');
  if (contactTitle) {
    document.fonts.ready.then(() => {
      const split = SplitText.create(contactTitle, { type: 'words,lines', linesClass: 'overflow-hidden pb-[0.08em]' });
      gsap.from(split.words, { yPercent: 100, opacity: 0, stagger: 0.04, duration: 0.8, scrollTrigger: once(contactTitle, 'top 90%') });
    });
  }
  gsap.from('.contact-fade', { y: 20, opacity: 0, stagger: 0.1, duration: 0.6, delay: 0.3, scrollTrigger: once('#contact', 'top 75%') });
  gsap.fromTo('.contact-glow', { opacity: 0.35 }, { opacity: 0.5, duration: 3, ease: 'sine.inOut', repeat: -1, yoyo: true });

  /* ---------- Keep triggers accurate when layout changes (fonts, timeline expand, images) ---------- */
  let t: number | undefined;
  new ResizeObserver(() => {
    clearTimeout(t);
    t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.body);
}
