/**
 * WEHEM Digital Agency — app.js
 * Modules : Nav · Theme · Scroll · Counters · FAQ · Portfolio · Form · SW
 */

'use strict';

/* ─── HELPERS ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const raf = fn => requestAnimationFrame(fn);

/* ─── 1. NAVIGATION ─── */
function initNav() {
  const nav      = $('.nav');
  const burger   = $('.nav__burger');
  const mobileMenu = $('.nav__mobile');
  const body     = document.body;
  let lastScroll = 0;

  // Sticky + shrink on scroll
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 20);
    // Hide on scroll down, show on scroll up (like YouTube / Google)
    if (y > 100) {
      nav.style.transform = y > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastScroll = y;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    mobileMenu?.classList.toggle('is-open', open);
    body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open);
  });

  // Close on link click
  $$('.nav__mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      burger?.classList.remove('is-open');
      mobileMenu?.classList.remove('is-open');
      body.style.overflow = '';
    });
  });

  // Smooth scroll for all anchor links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top  = el.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─── 2. THEME TOGGLE ─── */
function initTheme() {
  const KEY = 'wehem-theme';
  const toggle = $('.nav__theme-toggle');
  const root   = document.documentElement;

  const getSystem = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const saved = localStorage.getItem(KEY);
  const theme = saved || getSystem();
  apply(theme);

  toggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    localStorage.setItem(KEY, next);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(KEY)) apply(e.matches ? 'dark' : 'light');
  });

  function apply(t) {
    root.dataset.theme = t;
    if (toggle) toggle.textContent = t === 'dark' ? '☀️' : '🌙';
    if (toggle) toggle.setAttribute('aria-label', t === 'dark' ? 'Mode clair' : 'Mode sombre');
  }
}

/* ─── 3. SCROLL REVEAL ─── */
function initReveal() {
  if (!window.IntersectionObserver) {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.add('is-visible');
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  $$('.reveal').forEach(el => obs.observe(el));
}

/* ─── 4. COUNTER ANIMATION ─── */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length || !window.IntersectionObserver) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      obs.unobserve(target);
      const end = parseFloat(target.dataset.count);
      const suffix = target.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = end * eased;
        target.textContent = (Number.isInteger(end) ? Math.round(val) : val.toFixed(1)) + suffix;
        if (progress < 1) raf(tick);
      };

      raf(tick);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

/* ─── 5. FAQ ACCORDION ─── */
function initFAQ() {
  $$('.faq-item__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const open = item.classList.contains('is-open');

      // Close all
      $$('.faq-item').forEach(el => {
        el.classList.remove('is-open');
        el.querySelector('.faq-item__trigger')?.setAttribute('aria-expanded', 'false');
      });

      // Open clicked if was closed
      if (!open) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ─── 6. PORTFOLIO FILTER ─── */
function initPortfolio() {
  const filterBtns = $$('.filter-btn');
  const cards      = $$('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category || 'all';
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.animate([
            { opacity: 0, transform: 'scale(.96)' },
            { opacity: 1, transform: 'scale(1)' }
          ], { duration: 300, fill: 'both', easing: 'cubic-bezier(.22,1,.36,1)' });
        }
      });
    });
  });
}

/* ─── 7. BLOG ARTICLE EXPAND ─── */
function initBlog() {
  $$('.blog-card__link[data-article]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id      = link.dataset.article;
      const article = document.getElementById(id);
      if (!article) return;

      const isOpen = article.classList.contains('is-open');
      $$('.blog-article').forEach(a => a.classList.remove('is-open'));
      if (!isOpen) {
        article.classList.add('is-open');
        setTimeout(() => {
          const top = article.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 50);
      }
    });
  });
}

/* ─── 8. CONTACT FORM ─── */
function initForm() {
  const form = $('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn    = form.querySelector('[type="submit"]');
    const data   = new FormData(form);
    const status = form.querySelector('.form-status');

    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.reset();
        showStatus(status, '✅ Message envoyé ! Nous vous répondrons sous 24h.', 'success');
        btn.textContent = 'Envoyé ✓';
      } else {
        throw new Error('Server error');
      }
    } catch {
      showStatus(status, '❌ Une erreur s\'est produite. Écrivez-nous directement sur WhatsApp.', 'error');
      btn.disabled = false;
      btn.textContent = 'Envoyer ma demande →';
    }
  });

  function showStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `form-status form-status--${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 7000);
  }
}

/* ─── 9. LAZY IMAGES ─── */
function initLazyImages() {
  if (!window.IntersectionObserver) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const src = target.dataset.src;
      if (src) {
        target.src = src;
        target.removeAttribute('data-src');
      }
      obs.unobserve(target);
    });
  }, { rootMargin: '200px 0px' });

  $$('img[data-src]').forEach(img => obs.observe(img));
}

/* ─── 10. ACTIVE NAV LINK ON SCROLL ─── */
function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link[href^="#"]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        navLinks.forEach(l => l.classList.remove('nav__link--active'));
        const active = navLinks.find(l => l.getAttribute('href') === `#${target.id}`);
        active?.classList.add('nav__link--active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
}

/* ─── 11. SERVICE WORKER ─── */
function initSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTheme();
  initReveal();
  initCounters();
  initFAQ();
  initPortfolio();
  initBlog();
  initForm();
  initLazyImages();
  initActiveNav();
  initSW();
});
