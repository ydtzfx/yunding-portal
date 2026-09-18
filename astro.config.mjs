import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({ site: 'https://ydtzfx.github.io', base: '/yunding-portal', integrations: [sitemap()] });
