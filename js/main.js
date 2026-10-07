import {
  buildMailto,
  filterStatus,
  matchesFilter,
  resolveTheme,
  toggleTheme,
  validateContact,
} from './lib.js';

const CONTACT_EMAIL = 'josephobaje264@gmail.com';
const root = document.documentElement;

/* Theme ------------------------------------------------------------------ */

function readStoredTheme() {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
}

function applyTheme(theme, persist) {
  root.setAttribute('data-theme', theme);
  const button = document.querySelector('.theme-toggle');
  if (button) {
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
  if (persist) {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage unavailable: the choice lasts for this page view */
    }
  }
}

function initTheme() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(resolveTheme(readStoredTheme(), media.matches), false);
  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(toggleTheme(current), true);
  });
  media.addEventListener('change', (event) => {
    if (!readStoredTheme()) {
      applyTheme(event.matches ? 'dark' : 'light', false);
    }
  });
}

/* Navigation --------------------------------------------------------------- */

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) {
    return;
  }
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Highlight the nav link for the section currently in view.
  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) {
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          for (const link of links) {
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          }
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
}

/* Project filters ---------------------------------------------------------- */

function initFilters() {
  const buttons = [...document.querySelectorAll('.filter-btn')];
  const cards = [...document.querySelectorAll('.project-card')];
  const status = document.getElementById('filter-status');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter ?? 'all';
      let visible = 0;
      for (const card of cards) {
        const show = matchesFilter(card.dataset.tags ?? '', filter);
        card.hidden = !show;
        visible += show ? 1 : 0;
      }
      for (const other of buttons) {
        other.setAttribute('aria-pressed', String(other === button));
      }
      if (status) {
        status.textContent = filterStatus(visible, filter);
      }
    });
  }
}

/* Contact form (mailto, no backend) --------------------------------------- */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const fields = {
      name: String(data.get('name') ?? ''),
      subject: String(data.get('subject') ?? ''),
      message: String(data.get('message') ?? ''),
    };
    const errors = validateContact(fields);
    let firstInvalid = null;
    for (const key of Object.keys(fields)) {
      const input = form.elements.namedItem(key);
      const errorEl = document.getElementById(`cf-${key}-error`);
      const message = errors[key] ?? '';
      if (errorEl) {
        errorEl.textContent = message;
      }
      if (input instanceof HTMLElement) {
        input.setAttribute('aria-invalid', String(Boolean(message)));
        if (message && !firstInvalid) {
          firstInvalid = input;
        }
      }
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    window.location.href = buildMailto(CONTACT_EMAIL, fields);
  });
}

/* Boot --------------------------------------------------------------------- */

const year = document.getElementById('year');
if (year) {
  year.textContent = String(new Date().getFullYear());
}
initTheme();
initNav();
initFilters();
initContactForm();
