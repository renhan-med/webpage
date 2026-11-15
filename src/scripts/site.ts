/** Header behaviour: theme toggle, language menu, mobile menu. Runs on every page. */

const root = document.documentElement;

// --- Theme ------------------------------------------------------------------

const THEME_KEY = 'theme';
const THEME_COLORS = { light: '#faf8f3', dark: '#08182d' } as const;
type Theme = keyof typeof THEME_COLORS;

const themeToggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');

function currentTheme(): Theme {
  return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  root.dataset.theme = theme;
  themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

applyTheme(currentTheme());

themeToggle?.addEventListener('click', () => {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this page.
  }
});

// Follow the system setting until the visitor chooses a theme themselves.
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch {
    // ignore
  }
  if (!stored) applyTheme(event.matches ? 'dark' : 'light');
});

// --- Language menu (desktop dropdown) ---------------------------------------

const lang = document.querySelector<HTMLElement>('[data-lang]');
const langButton = lang?.querySelector<HTMLButtonElement>('[data-lang-button]');

function setLangOpen(open: boolean): void {
  langButton?.setAttribute('aria-expanded', String(open));
}

if (lang && langButton) {
  langButton.addEventListener('click', () => {
    setLangOpen(langButton.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('click', (event) => {
    if (!lang.contains(event.target as Node)) setLangOpen(false);
  });

  lang.addEventListener('focusout', (event) => {
    if (!lang.contains(event.relatedTarget as Node | null)) setLangOpen(false);
  });

  lang.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && langButton.getAttribute('aria-expanded') === 'true') {
      setLangOpen(false);
      langButton.focus();
    }
  });
}

// --- Mobile menu ------------------------------------------------------------

const header = document.querySelector<HTMLElement>('[data-header]');
const menuToggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
// The breakpoint lives in CSS (--menu-breakpoint in tokens.css), so the script never duplicates it.
const menuBreakpoint = getComputedStyle(root).getPropertyValue('--menu-breakpoint').trim() || '75rem';
const desktop = matchMedia(`(min-width: ${menuBreakpoint})`);
// While the sheet is open, the page behind it is neither scrollable nor reachable.
const background = [document.querySelector('main'), document.querySelector('body > footer')].filter(
  (element): element is HTMLElement => element !== null,
);

function isMenuOpen(): boolean {
  return root.hasAttribute('data-menu-open');
}

function setMenuOpen(open: boolean): void {
  if (!menuToggle) return;
  root.toggleAttribute('data-menu-open', open);
  for (const element of background) element.inert = open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', (open ? menuToggle.dataset.labelClose : menuToggle.dataset.labelOpen) ?? '');
}

if (header && menuToggle) {
  menuToggle.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

  header.addEventListener('keydown', (event) => {
    if (!isMenuOpen()) return;

    if (event.key === 'Escape') {
      setMenuOpen(false);
      menuToggle.focus();
      return;
    }

    // Keep keyboard focus inside the header while the sheet covers the page.
    if (event.key === 'Tab') {
      const focusable = [...header.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
        (element) => element.getClientRects().length > 0,
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

// --- Language links keep the contact form's prefill ----------------------------

// On the contact page, `?topic=&item=` survives a language switch (only those two keys, nothing else).
const kept = new URLSearchParams();
const current = new URLSearchParams(window.location.search);
for (const key of ['topic', 'item']) {
  const value = current.get(key);
  if (value) kept.set(key, value);
}
if (kept.size > 0) {
  document.querySelectorAll<HTMLAnchorElement>('a[data-keep-query]').forEach((link) => {
    const url = new URL(link.href, window.location.href);
    url.search = kept.toString();
    url.hash = 'form';
    link.href = url.pathname + url.search + url.hash;
  });
}
