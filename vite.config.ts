import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import type { Plugin } from 'vite';

/**
 * Metadatos con URL absoluta (og:image, og:url). La URL pública sale de
 * VITE_SITE_URL; por defecto, la de GitHub Pages del repositorio.
 */
function socialMeta(): Plugin {
  const site = (process.env.VITE_SITE_URL ?? 'https://gamesfullz.github.io/Restaurant-Web/').replace(/\/?$/, '/');
  return {
    name: 'mesa-social-meta',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { property: 'og:url', content: site }, injectTo: 'head' },
      { tag: 'meta', attrs: { property: 'og:image', content: `${site}og.jpg` }, injectTo: 'head' },
      { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
      { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
      { tag: 'meta', attrs: { name: 'twitter:image', content: `${site}og.jpg` }, injectTo: 'head' },
    ],
  };
}

/** Precarga las dos fuentes que pintan el primer pantallazo (display condensada y serif itálica). */
function preloadCriticalFonts(): Plugin {
  let base = '/';
  return {
    name: 'mesa-preload-fonts',
    configResolved(c) {
      base = c.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return;
        const wanted = [/archivo-latin-wdth-normal-.*\.woff2$/, /instrument-serif-latin-400-italic-.*\.woff2$/];
        return Object.values(ctx.bundle)
          .filter((f) => wanted.some((re) => re.test(f.fileName)))
          .map((f) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: base + f.fileName, crossorigin: '' },
            injectTo: 'head' as const,
          }));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadCriticalFonts(), socialMeta()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (/[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) return 'react';
          if (/[\\/](gsap|lenis)[\\/]/.test(id)) return 'motion';
          if (/[\\/]three[\\/]/.test(id)) return 'three';
        },
      },
    },
  },
  server: { host: true, port: 5173 },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
} as any);
