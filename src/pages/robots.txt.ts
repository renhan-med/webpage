import type { APIRoute } from 'astro';
import { withBase } from '../site.mjs';

/** robots.txt with the sitemap on the configured domain (SITE_URL), so it never points at a stale host. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(withBase('/sitemap-index.xml'), site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
