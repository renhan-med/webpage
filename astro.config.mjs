// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { sitemapLinks } from './src/i18n/sitemap.mjs';
// `site` is the origin only: Astro adds `base` itself (sitemap, Astro.url); a path in `site` would double it.
import { siteOrigin as site, basePath as base } from './src/site.mjs';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    icon(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const links = sitemapLinks(item.url, site);
        return links ? { ...item, links } : item;
      },
    }),
  ],
});
