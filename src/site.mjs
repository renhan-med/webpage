/**
 * Where the site is published. Single source for astro.config.mjs (site + base), links, SEO URLs and the tests.
 *
 * SITE_URL may include a path: on GitHub Pages without the custom domain the CD workflow passes
 * e.g. `https://renhan-med.github.io/webpage`, and every link then starts with `/webpage/`.
 * With the custom domain (default) the site lives at the root: `https://renhan.pl`.
 */
const url = new URL(process.env.SITE_URL ?? 'https://renhan.pl');

/** Scheme + host, e.g. `https://renhan.pl`. */
export const siteOrigin = url.origin;

/** Path the site is served under, always with a trailing slash: `/` or `/webpage/`. */
export const basePath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;

/** Full site URL without the trailing slash, e.g. `https://renhan.pl` or `https://renhan-med.github.io/webpage`. */
export const siteUrl = `${siteOrigin}${basePath}`.replace(/\/$/, '');

/**
 * Prefix a root-relative path (`/favicon.svg`, `/oferta/`) with the base path.
 * @param {string} path
 */
export const withBase = (path) => `${basePath.replace(/\/$/, '')}${path}`;
