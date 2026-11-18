import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import { normalizePath, resolvePage } from './src/site.ts';

export default defineConfig(({ isPreview, isSsrBuild }) => ({
  // Dev resolves pages from its shared shell; preview serves the built HTML.
  appType: isPreview ? 'mpa' : 'spa',
  server: { allowedHosts: ['.e2b.app'] },
  preview: { allowedHosts: ['.e2b.app'] },
  plugins: [{
    name: 'static-site-preview',
    configurePreviewServer(server) {
      const errorPage = resolve(server.config.root, server.config.build.outDir, '404.html');
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const url = new URL(req.url ?? '/', 'http://preview.invalid');
        const accept = req.headers.accept ?? '*/*';
        if (extname(url.pathname) || !(accept.includes('text/html') || accept.includes('*/*'))) return next();
        const path = normalizePath(url.pathname);
        if (path === '/admin' || resolvePage(path).kind !== 'not-found') {
          if (path === url.pathname) return next();
          res.writeHead(308, { Location: `${path}${url.search}` });
          res.end();
          return;
        }
        if (!existsSync(errorPage)) return next();
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(req.method === 'HEAD' ? undefined : readFileSync(errorPage));
      });
    },
  }],
  build: {
    rolldownOptions: {
      // Leave Vite's SSR entry intact; only the browser build gets both HTML shells.
      ...(!isSsrBuild && { input: { storefront: resolve('index.html'), operations: resolve('admin.html') } }),
      output: { comments: { legal: true } },
    },
    license: { fileName: 'third-party-licenses.txt' },
  },
}));
