// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { sitemapLinks } from './src/i18n/sitemap.mjs';
import { siteUrl as site } from './src/site.mjs';

// https://astro.build/config
export default defineConfig({
  site,
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
