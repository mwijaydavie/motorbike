import { defineConfig } from 'vite';

export default defineConfig({
  server: { allowedHosts: ['.e2b.app'] },
  preview: { allowedHosts: ['.e2b.app'] },
  build: {
    rolldownOptions: { output: { comments: { legal: true } } },
    license: { fileName: 'third-party-licenses.txt' },
  },
});
