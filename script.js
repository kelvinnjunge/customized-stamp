/**
 * Customised Stamps Kenya — script.js
 * ES6+ | no var | separated from HTML for security & cacheability
 * ─────────────────────────────────────────────────────────────────
 * Sections:
 *   1. Config
 *   2. WhatsApp order sender
 *   3. Smooth scroll
 *   4. Product shop filter (index page)
 *   5. Nav: keyboard & aria for dropdowns
 *   6. Lazy-load fallback images
 *   7. Active nav link highlighter
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

/* ── 1. CONFIG ──────────────────────────────────────────────── */
const CONFIG = Object.freeze({
  WA_NUMBER : '254778046004',
  BRAND     : 'Customised Stamps Kenya',
  get WA_BASE() {
    return `https://wa.me/${this.WA_NUMBER}?text=`;
  },
});

/* ── 2. WHATSAPP ORDER SENDER ───────────────────────────────── */
/**
 * Reads the order form fields, builds a WhatsApp message,
 * and opens it in a new tab.
 */
const sendWA = () => {
  const get = (id) => document.getElementById(id)?.value?.trim() ?? '';

  const name    = get('fn') || 'Customer';
  const phone   = get('fp') || 'Not provided';
  const product = get('ft') || 'Not specified';
  const qty     = get('fq') || '1';
  const details = get('fm') || '';

  const message = [
    `Hello ${CONFIG.BRAND}!`,
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Product: ${product}`,
    `Qty: ${qty}`,
    `Details: ${details}`,
  ].join('\n');

  const url = CONFIG.WA_BASE + encodeURIComponent(message);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/* Attach to form submit */
const orderForm = document.querySelector('form[aria-label="Stamp order form"]');
if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendWA();
  });
}

/* Expose sendWA globally for any inline onclick fallbacks */
window.sendWA = sendWA;

/* ── 3. SMOOTH SCROLL ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── 4. PRODUCT SHOP FILTER (index page only) ───────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const shopCards  = document.querySelectorAll('#shop-grid .product-card');

if (filterBtns.length && shopCards.length) {

  const applyFilter = (filter) => {
    shopCards.forEach((card) => {
      const cats = (card.dataset.cat ?? '').split(' ');
      const show = filter === 'all' || cats.includes(filter);
      card.style.display = show ? '' : 'none';
    });

    /* Featured card: only visible on "all" or "seal" */
    const featured = document.querySelector('.featured-card');
    if (featured) {
      featured.style.display =
        filter === 'all' || filter === 'seal' ? '' : 'none';
    }
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      /* Update active state */
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      /* Apply filter */
      applyFilter(btn.dataset.filter ?? 'all');
    });
  });
}

/* ── 5. NAV: KEYBOARD & ARIA FOR DROPDOWNS ──────────────────── */
/**
 * Enhances dropdown menus for keyboard accessibility.
 * - Space / Enter on trigger button opens dropdown.
 * - Escape closes any open dropdown.
 * - Manages aria-expanded correctly.
 */
const navItems = document.querySelectorAll('.nav-links > li');

navItems.forEach((item) => {
  const trigger  = item.querySelector('button');
  const dropdown = item.querySelector('.dropdown');

  if (!trigger || !dropdown) return;

  const open = () => {
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.removeAttribute('hidden');
  };

  const close = () => {
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('hidden', '');
  };

  /* Mouse: hover handled by CSS; sync aria on enter/leave */
  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', close);

  /* Keyboard: toggle on Space / Enter */
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    }
    if (e.key === 'Escape') close();
  });

  /* Close when focus leaves the item entirely */
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget)) close();
  });
});

/* Global Escape to close all dropdowns */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    navItems.forEach((item) => {
      const trigger  = item.querySelector('button');
      const dropdown = item.querySelector('.dropdown');
      if (trigger && dropdown) {
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('hidden', '');
      }
    });
  }
});

/* ── 6. LAZY-LOAD FALLBACK IMAGES ───────────────────────────── */
/**
 * If an img fails to load (broken URL), replace it with a
 * styled placeholder div so the layout never breaks.
 */
const FALLBACK_ICONS = {
  'dater'      : '📅',
  'pocket'     : '🖐️',
  'heavy-duty' : '💪',
  'non-dater'  : '🔤',
  'seal'       : '🔐',
  'desktop'    : '🖥️',
  'default'    : '🔏',
};

document.querySelectorAll('img[loading="lazy"], img[loading="eager"]').forEach((img) => {
  img.addEventListener('error', () => {
    const page  = window.location.pathname;
    let   icon  = FALLBACK_ICONS.default;

    Object.keys(FALLBACK_ICONS).some((key) => {
      if (page.includes(key)) { icon = FALLBACK_ICONS[key]; return true; }
      return false;
    });

    const ph = document.createElement('div');
    ph.className   = 'page-hero-img-ph';
    ph.textContent = icon;
    ph.setAttribute('aria-hidden', 'true');
    img.replaceWith(ph);
  }, { once: true });
});

/* ── 7. ACTIVE NAV LINK HIGHLIGHTER ────────────────────────── */
/**
 * Adds `.active` class to the nav <li> whose link matches
 * the current page filename.
 */
(() => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links > li > a').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    if (href && currentPage === href) {
      link.closest('li')?.classList.add('active');
    }
  });

  /* Also mark parent <li> if a dropdown child matches */
  document.querySelectorAll('.dropdown a').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    if (href && currentPage === href) {
      link.closest('.nav-links > li')?.classList.add('active');
    }
  });
})();
