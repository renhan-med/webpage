/**
 * The site's public origin. Used by astro.config.mjs (canonical, hreflang, sitemap, robots, OG)
 * and by the tests. Override with the SITE_URL environment variable (e.g. for a staging host).
 */
export const siteUrl = process.env.SITE_URL ?? 'https://renhan.pl';
